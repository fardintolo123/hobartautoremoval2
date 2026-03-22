import { generateText } from "ai"

export async function POST(req: Request) {
  const formData = await req.formData()

  const roomType = formData.get("roomType") as string
  const size = formData.get("size") as string
  const condition = formData.get("condition") as string
  const suburb = formData.get("suburb") as string
  const notes = formData.get("notes") as string
  const imageFiles = formData.getAll("images") as File[]

  // Build image parts for Gemini vision
  const imageParts: { type: "image"; image: string; mimeType: string }[] = []
  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    imageParts.push({
      type: "image",
      image: base64,
      mimeType: file.type as string,
    })
  }

  const prompt = `You are a professional painting estimator in New Zealand with deep knowledge of Auckland and NZ regional pricing.

A homeowner has submitted the following job details:
- Room / area type: ${roomType || "Not specified"}
- Approximate size: ${size || "Not specified"}
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
    const result = await generateText({
      model: "google/gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: [
            ...imageParts,
            { type: "text", text: prompt },
          ],
        },
      ],
    })

    // Strip markdown fences if model wraps response
    const raw = result.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()
    const parsed = JSON.parse(raw)
    return Response.json({ success: true, estimate: parsed })
  } catch (err) {
    console.error("[v0] Estimate API error:", err)
    return Response.json({ success: false, error: "Failed to generate estimate. Please try again." }, { status: 500 })
  }
}
