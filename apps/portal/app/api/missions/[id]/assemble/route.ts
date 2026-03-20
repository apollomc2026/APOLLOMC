import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { uploadToS3, getFromS3 } from '@/lib/s3/client'
import { readFile } from 'fs/promises'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: missionId } = await params
  const supabase = await createServiceClient()

  // Load mission with joins
  const { data: mission } = await supabase
    .from('missions')
    .select('*, deliverable_types(*), style_templates(*), industries(*)')
    .eq('id', missionId)
    .single()

  if (!mission) {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
  }

  const deliverable = (mission as any).deliverable_types
  const style = (mission as any).style_templates
  const industry = (mission as any).industries

  // Load intake session
  const { data: intake } = await supabase
    .from('intake_sessions')
    .select('*')
    .eq('mission_id', missionId)
    .single()

  const collected = intake?.collected || {}

  // Load uploaded files
  const { data: files } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('mission_id', missionId)

  // Load module definition for sections
  let moduleDefinition: any = null
  try {
    const modulePath = path.join(
      process.cwd(),
      '..',
      '..',
      'packages',
      'catalog',
      'modules',
      `${deliverable.slug}.json`
    )
    moduleDefinition = JSON.parse(await readFile(modulePath, 'utf-8'))
  } catch {
    // Module not found
  }

  // Load style template content
  let styleContent = ''
  try {
    const stylePath = path.join(
      process.cwd(),
      '..',
      '..',
      'packages',
      'style-library',
      industry.slug,
      `${style.slug}.md`
    )
    styleContent = await readFile(stylePath, 'utf-8')
  } catch {
    styleContent = '# Default Style\nUse professional formatting.'
  }

  // Build PLAN.md
  const sections = moduleDefinition?.sections || []
  let planMd = `# APOLLO BUILD MISSION
**Mission ID:** ${missionId}
**Deliverable:** ${deliverable.label}
**Industry:** ${industry.label}
**Style:** ${style.label}
**Date:** ${new Date().toISOString().split('T')[0]}

---

## EXECUTION DIRECTIVE
Read every section of this plan before writing anything.
Execute sections in the order listed.
Write each completed section to: staging/${missionId}/[section_key].json
Do not stop until all sections are complete and compiled.

---

## STYLE RULES
${styleContent}

---

## CUSTOMER INPUTS
`
  for (const [key, value] of Object.entries(collected as Record<string, string>)) {
    planMd += `- **${key}:** ${value}\n`
  }

  // Reference documents
  if (files && files.length > 0) {
    planMd += '\n---\n\n## REFERENCE DOCUMENTS\n'
    for (const f of files) {
      planMd += `\n### ${f.original_name}\n`
      if (f.extracted_json) {
        const extracted = f.extracted_json as any
        planMd += `Extracted text: ${(extracted.text || '').slice(0, 4000)}\n`
        if (extracted.tables?.length) {
          planMd += `Tables detected: ${extracted.tables.length}\n`
        }
      } else {
        planMd += `Status: ${f.extraction_status}\n`
      }
    }
  }

  // Sections
  planMd += '\n---\n\n## SECTIONS TO BUILD\n'
  planMd += 'Build each section completely before moving to the next.\n\n'

  sections.forEach((section: any, i: number) => {
    planMd += `### Section ${i + 1}: ${section.label} [${section.key}]
**Required:** ${section.required !== false}
**Estimated length:** ${section.min_words}–${section.max_words} words
**Instructions:** ${section.instructions || 'Write professionally and completely.'}
**Checkpoint:** Write completed section to staging/${missionId}/${section.key}.json

`
  })

  planMd += `---

## COMPILE
After all sections are complete:
1. Assemble sections in order into final document
2. Apply style rules throughout
3. Verify page count matches estimate (${deliverable.estimated_pages_min}–${deliverable.estimated_pages_max} pages)
4. Write final output to outputs/${missionId}/v1/
5. Signal completion by writing outputs/${missionId}/v1/COMPLETE
`

  // Upload PLAN.md and CLAUDE.md to S3
  const planKey = `plans/${missionId}/PLAN.md`
  const claudeKey = `plans/${missionId}/CLAUDE.md`

  await uploadToS3(planKey, planMd, 'text/markdown')
  await uploadToS3(claudeKey, styleContent, 'text/markdown')

  // Create task rows for each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const dependsOn = i > 0 ? [] : [] // First task has no dependencies initially

    await supabase.from('tasks').insert({
      mission_id: missionId,
      task_type: 'generate_section',
      section_key: section.key,
      section_index: i,
      status: 'queued',
      depends_on: dependsOn,
      provider: 'claude-sonnet-4-20250514',
      max_attempts: 3,
    })
  }

  // Build mission brief
  const missionBrief = {
    deliverable: {
      label: deliverable.label,
      description: deliverable.description,
    },
    style: {
      label: style.label,
      description: style.description,
    },
    sections: sections.map((s: any) => ({
      key: s.key,
      label: s.label,
    })),
    estimated_pages: {
      min: deliverable.estimated_pages_min,
      max: deliverable.estimated_pages_max,
    },
    estimated_minutes: deliverable.estimated_minutes,
    files_received: (files || []).map((f: any) => ({
      name: f.original_name,
      extraction_status: f.extraction_status,
    })),
    inputs_summary: collected,
    price_cents: deliverable.base_price_cents,
  }

  // Update mission
  await supabase
    .from('missions')
    .update({
      plan_md_s3_key: planKey,
      claude_md_s3_key: claudeKey,
      mission_brief: missionBrief,
      status: 'brief_pending',
    })
    .eq('id', missionId)

  // Log event
  await supabase.from('events').insert({
    mission_id: missionId,
    event_type: 'plan_assembled',
    event_data: { sections_count: sections.length },
  })

  return NextResponse.json({ success: true, brief: missionBrief })
}
