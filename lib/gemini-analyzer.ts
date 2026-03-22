import { GeminiVisionAnalysis, ConditionLevel, NZ_PRICING_2026 } from './types'

/**
 * Gemini Vision Integration for Professional Painting Analysis
 *
 * This module analyzes exterior home images using Google's Gemini Vision API
 * to extract painting-relevant information and classify condition levels
 */

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface AnalysisPromptOptions {
  includeReferences?: boolean
  strictClassification?: boolean
}

class GeminiVisionAnalyzer {
  private apiKey: string
  private modelName = 'gemini-2.5-flash'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Build a specialized prompt for home painters
   * Instructs Gemini to look for professional painting assessment criteria
   */
  private buildAnalysisPrompt(options: AnalysisPromptOptions = {}): string {
    return `You are an expert professional house painter in New Zealand analyzing exterior home photos for accurate quote estimation.

ANALYSIS REQUIREMENTS:
1. Identify cladding type (e.g., bevel-back weatherboard, block, brick)
2. Estimate height using standard reference objects:
   - Standard NZ external door: 1.98m high
   - Standard weatherboard width: 150mm
3. Calculate wall dimensions: If you see 10 weatherboards between ground and window, height ≈ 1.5m
4. Identify "Coating Failure" - detect peeling, cracking, flaking
5. Estimate what percentage of visible surface has coating failure (0-100%)
6. Count visible storeys (1, 2, or 3+)
7. Determine if second floor is visible

CONDITION CLASSIFICATION (choose ONE):
- Level 1: Wash & Paint (smooth, no fading, <5% failure)
- Level 2: Standard Prep (minor fading, light weathering, 5-20% failure)
- Level 3: Heavy Prep (visible peeling/flaking, 20-50% failure, needs scraping)
- Level 4: Full Strip (major failure >50%, rust/mold, heat-gun stripping needed)

ACCESS DIFFICULTY:
- ground: Single storey, no ladder needed
- single-ladder: Single storey or low access
- complex-scaffold: 2+ storeys, requires professional scaffolding

PRICE RANGE ESTIMATION (NZ 2026 Professional Rates):
Based on condition level, estimate price per m²:
- Level 1 (Wash & Paint): $40-60/m² (low labor, minimal prep)
- Level 2 (Standard Prep): $60-90/m² (moderate prep, standard conditions)
- Level 3 (Heavy Prep): $90-150/m² (significant scraping, sanding required)
- Level 4 (Full Strip): $150-250/m² (major removal, heat-gun stripping)

Calculate estimated price range (NZD):
1. pricePerM2Low = condition level minimum
2. pricePerM2High = condition level maximum
3. baseCostLow = estimatedAreaM2 × pricePerM2Low
4. baseCostHigh = estimatedAreaM2 × pricePerM2High
5. If height > 3m: ADD height surcharge $800-2500 based on height
6. If storeys >= 2: ADD $2000-5000 for scaffolding
7. Add 15% GST to final range

RESPONSE FORMAT (as JSON only, no markdown):
{
  "claddingType": "string",
  "estimatedHeightM": number,
  "estimatedAreaM2": number (length × height, don't subtract windows),
  "coatingFailurePercentage": number (0-100),
  "conditionLevel": "level1|level2|level3|level4",
  "storeys": number,
  "hasSecondFloor": boolean,
  "accessDifficulty": "ground|single-ladder|complex-scaffold",
  "recommendations": ["string", "string"],
  "confidence": number (0-100),
  "estimatedPriceRangeNZD": {
    "lowEstimate": number,
    "highEstimate": number,
    "midpointEstimate": number,
    "assumptions": "string (e.g., 'Includes 35m²/day with 2-painter crew, prep time, materials, GST')"
  }
}

If image doesn't show a house exterior, respond with:
{"error": "Image is not an exterior house wall. Cannot analyze."}
`
  }

  /**
   * Upload image to Gemini and get analysis
   * @param imageBase64 Base64 encoded image or image URL
   * @param options Analysis prompt options
   */
  async analyzeImage(imageBase64: string, options: AnalysisPromptOptions = {}): Promise<GeminiVisionAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(options)

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = (await response.json()) as GeminiResponse

      if (!data.candidates?.[0]) {
        throw new Error('No candidates in Gemini response')
      }

      const textResponse = data.candidates[0].content.parts[0].text
      const analysisData = JSON.parse(textResponse)

      if (analysisData.error) {
        throw new Error(analysisData.error)
      }

      return {
        claddingType: analysisData.claddingType,
        estimatedHeightM: analysisData.estimatedHeightM,
        estimatedAreaM2: analysisData.estimatedAreaM2,
        coatingFailurePercentage: analysisData.coatingFailurePercentage,
        conditionLevel: analysisData.conditionLevel,
        storeys: analysisData.storeys,
        hasSecondFloor: analysisData.hasSecondFloor,
        accessDifficulty: analysisData.accessDifficulty,
        recommendations: analysisData.recommendations,
        confidence: analysisData.confidence,
      }
    } catch (error) {
      throw new Error(`Failed to analyze image with Gemini: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Analyze image from URL directly
   */
  async analyzeImageUrl(imageUrl: string, options: AnalysisPromptOptions = {}): Promise<GeminiVisionAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(options)

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  fileData: {
                    mimeType: 'image/jpeg',
                    fileUri: imageUrl,
                  },
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = (await response.json()) as GeminiResponse
      const textResponse = data.candidates[0].content.parts[0].text
      const analysisData = JSON.parse(textResponse)

      if (analysisData.error) {
        throw new Error(analysisData.error)
      }

      return analysisData
    } catch (error) {
      throw new Error(`Failed to analyze image URL with Gemini: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Validate analysis confidence - reject low confidence estimates
   */
  validateConfidence(analysis: GeminiVisionAnalysis, minConfidence: number = 70): boolean {
    return analysis.confidence >= minConfidence
  }

  /**
   * Get human-readable condition summary
   */
  getConditionSummary(analysis: GeminiVisionAnalysis): string {
    const coatingFailure = analysis.coatingFailurePercentage

    if (coatingFailure > 50) return 'URGENT: Major coating failure'
    if (coatingFailure > 20) return 'Heavy prep required'
    if (coatingFailure > 5) return 'Standard prep recommended'
    return 'Good condition - minor work needed'
  }

  /**
   * Get height penalty flag
   */
  shouldApplyHeightPenalty(analysis: GeminiVisionAnalysis): boolean {
    return analysis.estimatedHeightM > 5 || analysis.storeys >= 2
  }

  /**
   * Get access surcharge recommendation
   */
  recommendAccessSurcharge(analysis: GeminiVisionAnalysis): number {
    if (analysis.accessDifficulty === 'ground') return 0
    if (analysis.accessDifficulty === 'single-ladder') return 0

    if (analysis.storeys === 2) {
      // Two storey typically needs $2k-$5k scaffolding
      return NZ_PRICING_2026.ACCESS_SURCHARGE.twoStoreyScaffolding.mid
    }

    if (analysis.storeys >= 3 || analysis.accessDifficulty === 'complex-scaffold') {
      return NZ_PRICING_2026.ACCESS_SURCHARGE.complexScaffolding.mid
    }

    return 0
  }
}

export const createGeminiAnalyzer = (apiKey: string) => new GeminiVisionAnalyzer(apiKey)

export default GeminiVisionAnalyzer
