import { GoogleGenerativeAI } from "@google/generative-ai"

// NZ painting rates per m² (ex-GST)
const BASE_RATES = {
  interior: { prep: 12, paint: 28, cleanup: 6 },
  exterior: { prep: 18, paint: 35, cleanup: 8 },
  ceiling: { prep: 10, paint: 22, cleanup: 5 },
  deck: { prep: 20, paint: 30, cleanup: 6 },
  fence: { prep: 8, paint: 18, cleanup: 4 },
}

const CONDITION_MULTIPLIER: Record<string, number> = {
  good: 0.8,
  fair: 1.0,
  poor: 1.3,
  peeling: 1.5,
  damaged: 1.7,
}

function generateFallbackEstimate(
  roomType: string,
  size: string,
  condition: string
) {
  // Parse size - extract number
  const sizeNum = parseFloat(size) || 20
  const area = Math.max(sizeNum, 5)

  // Determine rate category
  let rates = BASE_RATES.interior
  const rt = roomType.toLowerCase()
  if (rt.includes("exterior") || rt.includes("outside")) rates = BASE_RATES.exterior
  else if (rt.includes("ceiling")) rates = BASE_RATES.ceiling
  else if (rt.includes("deck")) rates = BASE_RATES.deck
  else if (rt.includes("fence")) rates = BASE_RATES.fence

  // Apply condition multiplier
  const condKey = Object.keys(CONDITION_MULTIPLIER).find((k) =>
    condition.toLowerCase().includes(k)
  )
  const mult = condKey ? CONDITION_MULTIPLIER[condKey] : 1.0

  const prepLow = Math.round(area * rates.prep * mult * 0.85)
  const prepHigh = Math.round(area * rates.prep * mult * 1.15)
  const paintLow = Math.round(area * rates.paint * mult * 0.85)
  const paintHigh = Math.round(area * rates.paint * mult * 1.15)
  const cleanLow = Math.round(area * rates.cleanup * 0.9)
  const cleanHigh = Math.round(area * rates.cleanup * 1.1)

  return {
    lineItems: [
      { label: "Surface preparation", low: prepLow, high: prepHigh },
      { label: "Two premium coats (Resene)", low: paintLow, high: paintHigh },
      { label: "Clean-up & site protection", low: cleanLow, high: cleanHigh },
    ],
    totalLow: prepLow + paintLow + cleanLow,
    totalHigh: prepHigh + paintHigh + cleanHigh,
    notes: `Estimate based on ~${area}m² ${rt || "interior"} area in ${condition || "fair"} condition. Final quote may vary after on-site inspection. Prices ex-GST.`,
    confidence: "medium" as const,
  }
}

export async function POST(req: Request) {
  const formData = await req.formData()

  const roomType = formData.get("roomType") as string
  const size = formData.get("size") as string
  const condition = formData.get("condition") as string
  const suburb = formData.get("suburb") as string
  const notes = formData.get("notes") as string
  const imageFiles = formData.getAll("images") as File[]

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    console.error("[v0] Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable")
    const fallback = generateFallbackEstimate(roomType, size, condition)
    return Response.json({ success: true, estimate: fallback, fallback: true })
  }

  const prompt = `You are a professional painting estimator in New Zealand with deep knowledge of Auckland and NZ regional pricing.

A homeowner has submitted the following job details:
- Room / area type: ${roomType || "Not specified"}
- Approximate size: ${size || "Not specified"} m²
- Current condition of surfaces: ${condition || "Not specified"}
- Suburb / location: ${suburb || "Not specified"}
- Additional notes: ${notes || "None"}
${imageFiles.length > 0 ? `- ${imageFiles.length} photo(s) attached for visual analysis` : ""}

Based on this information${imageFiles.length > 0 ? " and the attached photos" : ""}, provide a detailed painting estimate in New Zealand dollars (NZD).

Respond ONLY with a valid JSON object — no markdown, no explanation, just pure JSON — in this exact format:
{
  "lineItems": [
    { "label": "Surface preparation", "low": 0, "high": 0 },
    { "label": "Two premium coats (Resene)", "low": 0, "high": 0 },
    { "label": "Clean-up & site protection", "low": 0, "high": 0 }
  ],
  "totalLow": 0,
  "totalHigh": 0,
  "notes": "Brief 1-2 sentence explanation of the estimate and any key assumptions.",
  "confidence": "high | medium | low"
}

Use realistic Auckland market rates. If photos are provided, factor in visible surface conditions, room complexity, and any special prep work required. Always provide a price RANGE (low to high). Do not include GST — note this is ex-GST.`

  try {
    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Build image parts for Gemini
    const imageParts: { inlineData: { data: string; mimeType: string } }[] = []
    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      imageParts.push({
        inlineData: {
          data: base64,
          mimeType: file.type || "image/jpeg",
        },
      })
    }

    // Build content array
    const content: (
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    )[] = [{ text: prompt }, ...imageParts]

    const result = await model.generateContent(content)
    const responseText = result.response.text()

    // Strip markdown fences if model wraps response
    const raw = responseText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim()

    const parsed = JSON.parse(raw)
    return Response.json({ success: true, estimate: parsed })
  } catch (err) {
    console.error("[v0] Estimate API error (using fallback):", err)
    // Return a formula-based fallback estimate instead of failing
    const fallback = generateFallbackEstimate(roomType, size, condition)
    return Response.json({ success: true, estimate: fallback, fallback: true })
  }
}
