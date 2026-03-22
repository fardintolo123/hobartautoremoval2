import { ConditionLevel, GeminiVisionAnalysis, QuoteInput } from './types'

const DEFAULT_QUOTE_WEBHOOK_URL =
  'https://hook.eu2.make.com/uy2us3nslnbl9w41iefdcpftshu66wbg'

function isConditionLevel(v: unknown): v is ConditionLevel {
  return v === 'level1' || v === 'level2' || v === 'level3' || v === 'level4'
}

/**
 * Extracts a vision analysis object from Make.com / custom webhook JSON.
 * Accepts the same shape as the former Gemini output, or a minimal
 * { estimatedAreaM2, conditionLevel } payload.
 */
function extractAnalysisPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if ('estimatedAreaM2' in o && 'conditionLevel' in o) return o
  if (o.data && typeof o.data === 'object') {
    const inner = o.data as Record<string, unknown>
    if ('estimatedAreaM2' in inner && 'conditionLevel' in inner) return inner
  }
  if (o.analysis && typeof o.analysis === 'object') {
    const inner = o.analysis as Record<string, unknown>
    if ('estimatedAreaM2' in inner && 'conditionLevel' in inner) return inner
  }
  if (Array.isArray(data) && data[0] && typeof data[0] === 'object') {
    const inner = data[0] as Record<string, unknown>
    if ('estimatedAreaM2' in inner && 'conditionLevel' in inner) return inner
  }
  return null
}

function normalizeAnalysis(
  raw: Record<string, unknown>,
  userInput: QuoteInput
): GeminiVisionAnalysis | undefined {
  const area = Number(raw.estimatedAreaM2)
  if (!Number.isFinite(area) || area <= 0) return undefined

  const cond = raw.conditionLevel
  if (!isConditionLevel(cond)) return undefined

  const storeys = raw.storeys != null ? Number(raw.storeys) : userInput.storeyCount ?? 1
  const heightRaw = raw.estimatedHeightM != null ? Number(raw.estimatedHeightM) : undefined
  const userH = userInput.userEstimatedHeight
  const estimatedHeightM =
    heightRaw != null && Number.isFinite(heightRaw) && heightRaw > 0
      ? heightRaw
      : userH != null && userH > 0
        ? userH
        : 3

  return {
    claddingType: typeof raw.claddingType === 'string' ? raw.claddingType : 'unknown',
    estimatedHeightM,
    estimatedAreaM2: area,
    coatingFailurePercentage:
      raw.coatingFailurePercentage != null ? Number(raw.coatingFailurePercentage) || 0 : 0,
    conditionLevel: cond,
    storeys: Number.isFinite(storeys) && storeys > 0 ? storeys : 1,
    hasSecondFloor:
      typeof raw.hasSecondFloor === 'boolean'
        ? raw.hasSecondFloor
        : (userInput.storeyCount ?? 1) >= 2,
    accessDifficulty:
      raw.accessDifficulty === 'ground' ||
      raw.accessDifficulty === 'single-ladder' ||
      raw.accessDifficulty === 'complex-scaffold'
        ? raw.accessDifficulty
        : 'ground',
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.filter((x): x is string => typeof x === 'string')
      : [],
    confidence:
      raw.confidence != null ? Math.min(100, Math.max(0, Number(raw.confidence) || 0)) : 75,
    estimatedPriceRangeNZD:
      raw.estimatedPriceRangeNZD &&
      typeof raw.estimatedPriceRangeNZD === 'object' &&
      raw.estimatedPriceRangeNZD !== null
        ? (raw.estimatedPriceRangeNZD as GeminiVisionAnalysis['estimatedPriceRangeNZD'])
        : undefined,
  }
}

/**
 * POST image (base64) and form fields to Make.com webhook.
 * If the response body contains analysis JSON, it is parsed for the quote engine;
 * otherwise the quote uses the user's inputs only.
 */
export async function postQuoteToWebhook(
  input: QuoteInput & { imageBase64?: string; imageFileName?: string }
): Promise<GeminiVisionAnalysis | undefined> {
  const url = process.env.QUOTE_WEBHOOK_URL || DEFAULT_QUOTE_WEBHOOK_URL

  const { imageBase64, imageFileName, ...quoteFields } = input

  const payload = {
    ...quoteFields,
    imageBase64: imageBase64 ?? null,
    imageFileName: imageFileName ?? 'photo.jpg',
    submittedAt: new Date().toISOString(),
    source: 'professional-paint-quote-calculator',
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(
      `Quote webhook error: ${response.status} ${response.statusText}${text ? ` — ${text.slice(0, 300)}` : ''}`
    )
  }

  const trimmed = text.trim()
  if (!trimmed) return undefined

  let data: unknown
  try {
    data = JSON.parse(trimmed) as unknown
  } catch {
    return undefined
  }

  const extracted = extractAnalysisPayload(data)
  if (!extracted) return undefined

  return normalizeAnalysis(extracted, input)
}
