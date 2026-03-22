'use server'

import PainterQuoteEngine from './quote-engine'
import { postQuoteToWebhook } from './quote-webhook'
import { QuoteInput, QuoteCalculation } from './types'

/**
 * Server-side quote calculation. When an image is included, it is sent with all
 * inputs to the Make.com webhook (see lib/quote-webhook.ts).
 */

export async function calculateQuoteWithImage(
  input: QuoteInput & { imageBase64?: string; imageFileName?: string }
): Promise<QuoteCalculation & { error?: string }> {
  try {
    if (input.imageBase64) {
      console.log('📸 Sending quote image and inputs to webhook...')
      const analysis = await postQuoteToWebhook(input)
      if (analysis) {
        input.gemminiAnalysis = analysis
        console.log('✅ Webhook returned analysis fields for quote:', {
          area: analysis.estimatedAreaM2.toFixed(1) + ' m²',
          condition: analysis.conditionLevel,
        })
      } else {
        console.log('ℹ️ Webhook OK; using form inputs for quote (no analysis JSON in response).')
      }
    }

    if (
      (!input.userProvidedAreaM2 || input.userProvidedAreaM2 <= 0) &&
      !input.gemminiAnalysis
    ) {
      throw new Error(
        'Please enter wall area (m²), or configure your Make.com scenario to return JSON with estimatedAreaM2 and conditionLevel when using a photo without area.'
      )
    }

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
