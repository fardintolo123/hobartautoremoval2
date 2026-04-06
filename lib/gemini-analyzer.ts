import { GeminiVisionAnalysis, GeminiImageSummary, VehicleCondition, TASMANIA_PRICING_2026 } from './types'

/**
 * Gemini Vision Integration for Professional Car Removal Analysis
 *
 * This module analyzes vehicle images using Google's Gemini Vision API
 * to extract car removal-relevant information and classify vehicle conditions
 */

let cachedGenerateContentModel: string | null = null
let cachedGenerateContentModelPromise: Promise<string> | null = null

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
  private readonly conditionRank: Record<VehicleCondition, number> = {
    excellent: 1,
    good: 2,
    fair: 3,
    poor: 4,
    nonrunning: 5,
    damaged: 6,
  }

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Resolve a model name that is actually supported for `generateContent` on this API version.
   * Uses `models.list` so we avoid hardcoding retired/unsupported model names.
   */
  private async getGenerateContentModel(): Promise<string> {
    if (cachedGenerateContentModel) return cachedGenerateContentModel
    if (cachedGenerateContentModelPromise) return cachedGenerateContentModelPromise

    cachedGenerateContentModelPromise = (async () => {
      const listResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
      })

      if (!listResp.ok) {
        const raw = await listResp.text().catch(() => '')
        throw new Error(
          `Failed to list Gemini models: ${listResp.status} ${listResp.statusText} body=${raw}`
        )
      }

      const listData: any = await listResp.json()
      const models: any[] = listData?.models ?? []

      const supportsGenerateContent = (m: any): boolean => {
        const methods =
          m?.supportedGenerationMethods ??
          m?.supported_generation_methods ??
          m?.supportedMethods ??
          m?.supported_methods

        if (Array.isArray(methods)) {
          return methods.some((x) => String(x).toLowerCase().includes('generatecontent'))
        }

        // Fallback: inspect the model metadata blob for the method string.
        return JSON.stringify(m ?? {}).toLowerCase().includes('generatecontent')
      }

      const candidates = models
        .map((m) => {
          const fullName: string | undefined = m?.name
          const slug = fullName?.split('/').pop() ?? ''
          return { m, slug, fullName }
        })
        .filter((x) => x.slug && supportsGenerateContent(x.m))

      if (candidates.length === 0) {
        console.error('❌ No models found that support generateContent:', listData)
        throw new Error('No Gemini models support generateContent for v1beta')
      }

      // Prefer "flash" variants if available (faster/cheaper), otherwise pick the first supported model.
      candidates.sort((a, b) => {
        const aScore = (a.slug.includes('flash') ? 10 : 0) + (a.slug.includes('latest') ? 5 : 0)
        const bScore = (b.slug.includes('flash') ? 10 : 0) + (b.slug.includes('latest') ? 5 : 0)
        return bScore - aScore
      })

      cachedGenerateContentModel = candidates[0].slug
      console.log('✅ Resolved Gemini generateContent model:', cachedGenerateContentModel)
      return cachedGenerateContentModel
    })()

    return cachedGenerateContentModelPromise
  }

  /**
   * Build a specialized prompt for car removal professionals
   * Instructs Gemini to look for vehicle assessment criteria
   */
  private buildAnalysisPrompt(options: AnalysisPromptOptions = {}): string {
    return `You are an expert professional car removal specialist in Tasmania analyzing vehicle photos for accurate quote estimation.

ANALYSIS REQUIREMENTS:
1. Identify vehicle type: sedan, suv, truck, ute, van, motorcycle, caravan, or other
2. Estimate vehicle year/model from visible features, badges, or design cues
3. Estimate mileage from wear patterns (odometer if visible, or general condition)
4. Assess overall condition and identify damage
5. Check for rust, corrosion, or structural damage
6. Look for fluid leaks (oil, coolant, brake fluid stains)
7. Identify hazardous components (airbags, mercury switches, batteries)

VEHICLE CONDITION CLASSIFICATION (choose ONE):
- excellent: Running, low mileage, minimal rust/damage (<5 years old, <100k km)
- good: Running, moderate mileage, minor wear (5-10 years old, 100k-150k km)
- fair: Running but needs work, visible wear, surface rust (10-15 years old, 150k-200k km)
- poor: Non-running or barely running, significant rust/damage (15-20 years old, 200k+ km)
- nonrunning: Engine does not start, needs towing (any age, any mileage)
- damaged: Severe structural/mechanical damage, collision/fire/flood damage

HAZARDOUS COMPONENTS CHECK:
Look for: airbags, batteries, mercury switches, fuel system components, catalytic converters

PRICE RANGE ESTIMATION (Tasmania 2026 Rates):
Base fees by vehicle type (AUD):
- Motorcycle: $150
- Sedan: $300
- Ute: $400
- Van: $450
- SUV: $500
- Truck: $600
- Caravan: $800

Condition multipliers:
- excellent: 1.0x (no adjustment)
- good: 0.9x (10% discount)
- fair: 0.75x (25% discount)
- poor: 0.5x (50% discount)
- nonrunning: 0.4x (60% discount)
- damaged: 0.3x (70% discount)

Additional surcharges:
- Hazardous materials: +$150
- Fluid draining: +$75
- Internal removal: +$100
- Disassembly: +$200
- Location (regional): +$150-400
- Towing (>25km): +$3.50/km

Calculate estimated quote range (AUD):
1. baseFee = vehicle type base fee
2. adjustedFee = baseFee × condition multiplier
3. Add surcharges for hazmat, fluids, location, towing
4. Add 10% GST to final range

RESPONSE FORMAT (as JSON only, no markdown):
{
  "imageDescription": "string (1-2 short sentences describing visible vehicle details and condition cues)",
  "vehicleType": "sedan|suv|truck|ute|van|motorcycle|caravan|other",
  "estimatedYear": number,
  "estimatedMileage": number,
  "conditionLevel": "excellent|good|fair|poor|nonrunning|damaged",
  "damageAssessment": "string (brief description of visible damage)",
  "hasRust": boolean,
  "hasFluidLeaks": boolean,
  "hazardousComponents": ["string", "string"],
  "recommendations": ["string", "string"],
  "confidence": number (0-100),
  "estimatedQuoteAUD": {
    "lowEstimate": number,
    "highEstimate": number,
    "midpointEstimate": number,
    "assumptions": "string (e.g., 'Includes collection, environmental compliance, recycling. Excludes title transfer fees')"
  }
}

If image doesn't show a vehicle, respond with:
{"error": "Image is not a vehicle. Cannot analyze."}
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
      const model = await this.getGenerateContentModel()

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
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
        }
      )

      if (!response.ok) {
        const rawError = await response.text().catch(() => '')
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} body=${rawError}`)
      }

      const raw = await response.text()
      console.log('RAW RESPONSE:', raw)

      let data: GeminiResponse
      try {
        data = JSON.parse(raw) as GeminiResponse
      } catch (err) {
        console.error('❌ Gemini response was not valid JSON:', raw)
        throw err
      }

      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!textResponse) {
        console.error('❌ Unexpected Gemini response:', JSON.stringify(data, null, 2))
        throw new Error('Invalid Gemini response format')
      }

      let analysisData: any
      try {
        analysisData = JSON.parse(textResponse)
      } catch (err) {
        console.error('❌ Gemini returned non-JSON analysis text:', textResponse)
        throw err
      }

      if (analysisData.error) {
        throw new Error(analysisData.error)
      }

      return {
        imageDescription: analysisData.imageDescription,
        vehicleType: analysisData.vehicleType,
        estimatedYear: analysisData.estimatedYear,
        estimatedMileage: analysisData.estimatedMileage,
        conditionLevel: analysisData.conditionLevel,
        damageAssessment: analysisData.damageAssessment,
        hasRust: analysisData.hasRust,
        hasFluidLeaks: analysisData.hasFluidLeaks,
        hazardousComponents: analysisData.hazardousComponents,
        recommendations: analysisData.recommendations,
        confidence: analysisData.confidence,
      }
    } catch (error) {
      console.error('🔥 FULL ERROR:', error)
      throw new Error(`Failed to analyze image with Gemini: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Analyze image from URL directly
   */
  async analyzeImageUrl(imageUrl: string, options: AnalysisPromptOptions = {}): Promise<GeminiVisionAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(options)
      const model = await this.getGenerateContentModel()

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
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
        }
      )

      if (!response.ok) {
        const rawError = await response.text().catch(() => '')
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} body=${rawError}`)
      }

      const data: GeminiResponse = await response.json()
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!textResponse) {
        throw new Error('Invalid Gemini response format')
      }

      const analysisData = JSON.parse(textResponse)

      if (analysisData.error) {
        throw new Error(analysisData.error)
      }

      return {
        imageDescription: analysisData.imageDescription,
        vehicleType: analysisData.vehicleType,
        estimatedYear: analysisData.estimatedYear,
        estimatedMileage: analysisData.estimatedMileage,
        conditionLevel: analysisData.conditionLevel,
        damageAssessment: analysisData.damageAssessment,
        hasRust: analysisData.hasRust,
        hasFluidLeaks: analysisData.hasFluidLeaks,
        hazardousComponents: analysisData.hazardousComponents,
        recommendations: analysisData.recommendations,
        confidence: analysisData.confidence,
      }
    } catch (error) {
      throw new Error(`Failed to analyze image URL with Gemini: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Analyze multiple images and combine results
   */
  async analyzeImages(imageBase64s: string[], options: AnalysisPromptOptions = {}): Promise<GeminiVisionAnalysis> {
    if (imageBase64s.length === 0) {
      throw new Error('No images provided')
    }

    // Analyze first image as primary
    const primaryAnalysis = await this.analyzeImage(imageBase64s[0], options)

    // Create image summaries for additional images
    const imageSummaries: GeminiImageSummary[] = []

    for (let i = 1; i < imageBase64s.length; i++) {
      try {
        const analysis = await this.analyzeImage(imageBase64s[i], options)
        imageSummaries.push({
          index: i,
          description: analysis.imageDescription || '',
          confidence: analysis.confidence,
          conditionLevel: analysis.conditionLevel,
          damageLevel: analysis.damageAssessment || '',
        })

        // Update primary analysis with additional insights
        if (analysis.confidence > primaryAnalysis.confidence) {
          primaryAnalysis.conditionLevel = analysis.conditionLevel
          primaryAnalysis.confidence = analysis.confidence
        }

        // Combine hazardous components
        if (analysis.hazardousComponents) {
          primaryAnalysis.hazardousComponents = [
            ...(primaryAnalysis.hazardousComponents || []),
            ...analysis.hazardousComponents,
          ].filter((item, index, arr) => arr.indexOf(item) === index) // Remove duplicates
        }

        // Update flags
        primaryAnalysis.hasRust = primaryAnalysis.hasRust || analysis.hasRust
        primaryAnalysis.hasFluidLeaks = primaryAnalysis.hasFluidLeaks || analysis.hasFluidLeaks

      } catch (error) {
        console.warn(`Failed to analyze image ${i}:`, error)
      }
    }

    // Attach image summaries to primary analysis
    ;(primaryAnalysis as any).imageSummaries = imageSummaries

    return primaryAnalysis
  }

  /**
   * Validate analysis confidence
   */
  validateConfidence(analysis: GeminiVisionAnalysis, minimumConfidence: number = 70): boolean {
    return analysis.confidence >= minimumConfidence
  }

  /**
   * Get the most severe condition from multiple analyses
   */
  getWorstCondition(conditions: VehicleCondition[]): VehicleCondition {
    return conditions.reduce((worst, current) => {
      return this.conditionRank[current] > this.conditionRank[worst] ? current : worst
    })
  }
}

export default GeminiVisionAnalyzer
