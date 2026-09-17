import Anthropic from '@anthropic-ai/sdk'

const DEFAULT_TIMEOUT_MS = 120_000
const DEFAULT_MAX_RETRIES = 1

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * One bounded Anthropic client policy for every APOLLO AI path.
 *
 * A provider request must either complete or fail into APOLLO's durable retry
 * state. It must never leave Mission Control appearing to run indefinitely.
 */
export function createAnthropicClient(apiKey = process.env.ANTHROPIC_API_KEY): Anthropic {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({
    apiKey,
    timeout: positiveInteger(process.env.APOLLO_AI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxRetries: positiveInteger(process.env.APOLLO_AI_MAX_RETRIES, DEFAULT_MAX_RETRIES),
  })
}
