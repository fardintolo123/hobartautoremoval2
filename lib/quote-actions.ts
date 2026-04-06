'use server'

import CarRemovalQuoteEngine from './quote-engine'
import GeminiVisionAnalyzer from './gemini-analyzer'
import { QuoteInput, QuoteCalculationResponse } from './types'

/**
 * Server-side quote calculation with Gemini image analysis
 * This runs on the backend to keep the API key secure
 */

export async function calculateQuoteWithImage(
  input: QuoteInput
): Promise<QuoteCalculationResponse> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    console.log('API KEY EXISTS:', !!apiKey)
    console.log('🔍 API Key Check:', apiKey ? '✅ FOUND' : '❌ MISSING')

    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured')
    }

    const imagePayloads = (input.imagesBase64 || []).filter(Boolean)
    let geminiAnalysis: any = null

    // If images are provided, analyze with Gemini
    if (imagePayloads.length > 0) {
      if (imagePayloads.length > 5) {
        throw new Error('Maximum 5 images are supported')
      }

      console.log('📸 Starting Gemini Vision Analysis...')
      const analyzer = new GeminiVisionAnalyzer(apiKey)
      geminiAnalysis =
        imagePayloads.length === 1
          ? await analyzer.analyzeImage(imagePayloads[0])
          : await analyzer.analyzeImages(imagePayloads)

      console.log('✅ Gemini Analysis Complete:', {
        vehicleType: geminiAnalysis.vehicleType,
        year: geminiAnalysis.estimatedYear,
        condition: geminiAnalysis.conditionLevel,
        confidence: geminiAnalysis.confidence + '%',
        priceRange: (geminiAnalysis as any).estimatedQuoteAUD,
      })

      // Check confidence
      if (!analyzer.validateConfidence(geminiAnalysis, 70)) {
        console.warn(`⚠️ Low confidence analysis: ${geminiAnalysis.confidence}%`)
      }
    }

    // Calculate quote using the engine
    const engine = new CarRemovalQuoteEngine()
    const quote = engine.calculate(input)

    return {
      ...quote,
      geminiAnalysis,
      geminiImageSummaries: geminiAnalysis?.imageSummaries,
    }
  } catch (error) {
    return {
      vehicleType: 'other',
      vehicleYear: 0,
      vehicleCondition: 'fair',
      locationPostcode: '',
      baseFeeAUD: 0,
      conditionAdjustmentAUD: 0,
      conditionMultiplier: 1,
      locationSurchargeAUD: 0,
      hazardousMaterialsFeeAUD: 0,
      fluidDrainingFeeAUD: 0,
      internalRemovalFeeAUD: 0,
      disassemblyFeeAUD: 0,
      towingFeeAUD: 0,
      subtotalAUD: 0,
      gstAUD: 0,
      totalAUD: 0,
      assumptions: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Simple quote calculation without image (for text-only requests)
 */
export async function calculateQuote(input: QuoteInput): Promise<QuoteCalculationResponse> {
  try {
    const engine = new CarRemovalQuoteEngine()
    const quote = engine.calculate(input)

    return {
      ...quote,
    }
  } catch (error) {
    return {
      vehicleType: 'other',
      vehicleYear: 0,
      vehicleCondition: 'fair',
      locationPostcode: '',
      baseFeeAUD: 0,
      conditionAdjustmentAUD: 0,
      conditionMultiplier: 1,
      locationSurchargeAUD: 0,
      hazardousMaterialsFeeAUD: 0,
      fluidDrainingFeeAUD: 0,
      internalRemovalFeeAUD: 0,
      disassemblyFeeAUD: 0,
      towingFeeAUD: 0,
      subtotalAUD: 0,
      gstAUD: 0,
      totalAUD: 0,
      assumptions: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
