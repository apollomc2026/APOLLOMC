import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { uploadToS3, getFromS3 } from '@/lib/s3/client'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

async function executeTask(task: any, mission: any, priorSections: any[]) {
  // Load the PLAN.md and CLAUDE.md from S3
  const planMd = (await getFromS3(mission.plan_md_s3_key)).toString('utf-8')
  const claudeMd = (await getFromS3(mission.claude_md_s3_key)).toString('utf-8')

  // Build context from prior sections
  const priorContext = priorSections
    .map((s) => `## ${s.section_key}\n${JSON.stringify(s.output_json)}`)
    .join('\n\n')

  const systemPrompt = `You are Apollo MC, a professional document builder. Follow the style rules exactly.

${claudeMd}`

  const userPrompt = `Build the following section for this mission.

PLAN:
${planMd}

PRIOR SECTIONS ALREADY COMPLETED:
${priorContext || '(none yet — this is the first section)'}

NOW BUILD THIS SECTION:
- Section key: ${task.section_key}
- Section index: ${task.section_index}

Return your output as valid JSON with this structure:
{
  "section_key": "${task.section_key}",
  "title": "Section Title",
  "content": "Full section content here...",
  "word_count": 250
}

Write the full content. Do not use placeholders. Match the tone and style specified.`

  const response = await anthropic.messages.create({
    model: task.provider || 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Try to parse as JSON
  let outputJson: any
  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    outputJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: text }
  } catch {
    outputJson = { content: text, parse_error: true }
  }

  return {
    output_raw: text,
    output_json: outputJson,
    schema_valid: !outputJson.parse_error,
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  }
}

async function attemptRepair(task: any, error: string, originalOutput: string) {
  const response = await anthropic.messages.create({
    model: task.provider || 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Your output did not match the required schema. Here is the error: ${error}

Original output:
${originalOutput}

Please rewrite to match this JSON schema:
{
  "section_key": "${task.section_key}",
  "title": "Section Title",
  "content": "Full section content here...",
  "word_count": 250
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

// Worker endpoint — called by cron or webhook
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.WORKER_SECRET_KEY

  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Claim next queued task
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, missions(*)')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ message: 'No tasks to process' })
  }

  const task = tasks[0]
  const mission = (task as any).missions

  // Mark as running
  await supabase
    .from('tasks')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
      attempt_count: task.attempt_count + 1,
    })
    .eq('id', task.id)

  // Update mission status if first task
  if (mission.status === 'queued') {
    await supabase
      .from('missions')
      .update({ status: 'building', build_started_at: new Date().toISOString() })
      .eq('id', mission.id)
  }

  try {
    // Get prior completed sections for context
    const { data: priorSections } = await supabase
      .from('tasks')
      .select('section_key, output_json')
      .eq('mission_id', task.mission_id)
      .eq('status', 'complete')
      .order('section_index', { ascending: true })

    const result = await executeTask(task, mission, priorSections || [])

    // Write checkpoint to S3
    const checkpointKey = `staging/${task.mission_id}/${task.section_key}.json`
    await uploadToS3(checkpointKey, JSON.stringify(result.output_json), 'application/json')

    // Log prompt run
    await supabase.from('prompt_runs').insert({
      task_id: task.id,
      provider: 'anthropic',
      model: task.provider || 'claude-sonnet-4-20250514',
      prompt_tokens: result.usage.prompt_tokens,
      completion_tokens: result.usage.completion_tokens,
      total_tokens: result.usage.total_tokens,
    })

    // If schema invalid, attempt repair
    if (!result.schema_valid && task.repair_attempts < 1) {
      const repaired = await attemptRepair(task, 'Invalid JSON structure', result.output_raw)
      if (repaired) {
        result.output_json = repaired
        result.schema_valid = true
        await uploadToS3(checkpointKey, JSON.stringify(repaired), 'application/json')
      }
    }

    // Update task
    await supabase
      .from('tasks')
      .update({
        status: 'complete',
        output_raw: result.output_raw,
        output_json: result.output_json,
        schema_valid: result.schema_valid,
        checkpoint_s3_key: checkpointKey,
        completed_at: new Date().toISOString(),
        repair_attempts: result.schema_valid ? task.repair_attempts : task.repair_attempts + 1,
      })
      .eq('id', task.id)

    // Check if all tasks complete
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('mission_id', task.mission_id)

    const allComplete = allTasks?.every((t) => t.status === 'complete')

    if (allComplete) {
      // Mission complete — compile outputs
      await supabase
        .from('missions')
        .update({
          status: 'review',
          build_completed_at: new Date().toISOString(),
        })
        .eq('id', task.mission_id)

      // Create output record
      const outputKey = `outputs/${task.mission_id}/v1/document.json`
      const allOutputs = allTasks ? await supabase
        .from('tasks')
        .select('section_key, section_index, output_json')
        .eq('mission_id', task.mission_id)
        .eq('status', 'complete')
        .order('section_index', { ascending: true }) : null

      const compiled = {
        mission_id: task.mission_id,
        sections: allOutputs?.data || [],
        compiled_at: new Date().toISOString(),
      }

      await uploadToS3(outputKey, JSON.stringify(compiled), 'application/json')

      await supabase.from('outputs').insert({
        mission_id: task.mission_id,
        version: 1,
        format: 'json',
        s3_key_private: outputKey,
        status: 'preview_ready',
      })

      await supabase.from('events').insert({
        mission_id: task.mission_id,
        event_type: 'build_completed',
      })
    }

    await supabase.from('events').insert({
      mission_id: task.mission_id,
      event_type: 'task_complete',
      event_data: { task_id: task.id, section_key: task.section_key },
    })

    return NextResponse.json({ success: true, task_id: task.id })
  } catch (err: any) {
    // Handle failure
    const failedAttempts = task.attempt_count + 1

    if (failedAttempts >= task.max_attempts) {
      await supabase
        .from('tasks')
        .update({
          status: 'failed',
          error_message: err.message,
        })
        .eq('id', task.id)

      await supabase
        .from('missions')
        .update({ status: 'failed' })
        .eq('id', task.mission_id)

      await supabase.from('events').insert({
        mission_id: task.mission_id,
        event_type: 'task_failed',
        event_data: { task_id: task.id, error: err.message },
      })
    } else {
      // Requeue for retry
      await supabase
        .from('tasks')
        .update({
          status: 'queued',
          error_message: err.message,
        })
        .eq('id', task.id)
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
