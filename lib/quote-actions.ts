'use server'

import PainterQuoteEngine from './quote-engine'
import GeminiVisionAnalyzer from './gemini-analyzer'
import { QuoteInput, QuoteCalculation } from './types'

/**
 * Server-side quote calculation with Gemini image analysis
 * This runs on the backend to keep the API key secure
 */

export async function calculateQuoteWithImage(
  input: QuoteInput & { imageBase64?: string }
): Promise<QuoteCalculation & { error?: string }> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    console.log('API KEY EXISTS:', !!apiKey)
    console.log('🔍 API Key Check:', apiKey ? '✅ FOUND' : '❌ MISSING')
    
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured')
    }

    // If image is provided, analyze it with Gemini
    if (input.imageBase64) {
      console.log('📸 Starting Gemini Vision Analysis...')
      const analyzer = new GeminiVisionAnalyzer(apiKey)
      const analysis = await analyzer.analyzeImage(input.imageBase64)

      console.log('✅ Gemini Analysis Complete:', {
        area: analysis.estimatedAreaM2.toFixed(1) + ' m²',
        height: analysis.estimatedHeightM?.toFixed(1) + ' m',
        condition: analysis.conditionLevel,
        storeys: analysis.storeys,
        confidence: analysis.confidence + '%',
        priceRange: (analysis as any).estimatedPriceRangeNZD,
      })

      // Check confidence
      if (!analyzer.validateConfidence(analysis, 70)) {
        console.warn(`⚠️ Low confidence analysis: ${analysis.confidence}%`)
      }

      input.gemminiAnalysis = analysis
    }

    // Calculate quote using the engine
    const engine = new PainterQuoteEngine()
    const quote = engine.calculate(input)

    return quote
  } catch (error) {
    return {
      areaM2: 0,
      prepFactor: {
        baseHoursPerM2: 0,
        conditionMultiplier: 0,
        totalPrepHours: 0,
        prepCostNZD: 0,
      },
      laborHours: 0,
      laborCostNZD: 0,
      accessSurchargeNZD: 0,
      materialsCostNZD: 0,
      leadRemovalCostNZD: 0,
      coastalSurchargeCostNZD: 0,
      soffisFasciasCostNZD: 0,
      joineryWorkCostNZD: 0,
      subtotalNZD: 0,
      gstNZD: 0,
      totalNZD: 0,
      breakdown: { prep: 0, labor: 0, materials: 0, access: 0, compliance: 0, additionalWorks: 0 },
      assumptions: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Simple quote calculation without image (for text-only requests)
 */
export async function calculateQuote(input: QuoteInput): Promise<QuoteCalculation & { error?: string }> {
  try {
    const engine = new PainterQuoteEngine()
    return engine.calculate(input)
  } catch (error) {
    return {
      areaM2: 0,
      prepFactor: {
        baseHoursPerM2: 0,
        conditionMultiplier: 0,
        totalPrepHours: 0,
        prepCostNZD: 0,
      },
      laborHours: 0,
      laborCostNZD: 0,
      accessSurchargeNZD: 0,
      materialsCostNZD: 0,
      leadRemovalCostNZD: 0,
      coastalSurchargeCostNZD: 0,
      soffisFasciasCostNZD: 0,
      joineryWorkCostNZD: 0,
      subtotalNZD: 0,
      gstNZD: 0,
      totalNZD: 0,
      breakdown: { prep: 0, labor: 0, materials: 0, access: 0, compliance: 0, additionalWorks: 0 },
      assumptions: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
