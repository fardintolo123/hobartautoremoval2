import { NextRequest, NextResponse } from 'next/server'
import { calculateQuoteWithImage, calculateQuote } from '@/lib/quote-actions'
import { QuoteInput } from '@/lib/types'

/**
 * POST /api/quote
 * 
 * Calculate a painting quote with optional image analysis
 * 
 * Request body:
 * {
 *   imageBase64?: string,           // Base64 encoded image (without data: prefix)
 *   userProvidedAreaM2?: number,    // Wall area in square meters
 *   userEstimatedHeight?: number,   // Optional height estimate
 *   userSelectedCondition?: ConditionLevel,
 *   storeyCount?: number,
 *   paintSystem?: 'standard' | 'premium' | 'commercial',
 *   coatsRequired?: number,
 *   accessMethod?: 'ground' | 'single-ladder' | 'scaffolding'
 * }
 * 
 * Response:
 * {
 *   areaM2: number,
 *   laborHours: number,
 *   totalNZD: number,
 *   breakdown: { prep, labor, materials, access },
 *   assumptions: string[],
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    if (!body.userProvidedAreaM2 && !body.imageBase64) {
      return NextResponse.json(
        { error: 'Either imageBase64 or userProvidedAreaM2 is required' },
        { status: 400 }
      )
    }

    // Rate limiting (basic - check client IP)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    console.log(`Quote request from IP: ${clientIp}`)

    // Prepare input
    const quoteInput: QuoteInput = {
      userProvidedAreaM2: body.userProvidedAreaM2 || 0,
      userEstimatedHeight: body.userEstimatedHeight,
      userSelectedCondition: body.userSelectedCondition || 'level2',
      storeyCount: body.storeyCount || 1,
      paintSystem: body.paintSystem || 'premium',
      coatsRequired: body.coatsRequired || 2,
      accessMethod: body.accessMethod,
    }

    // Calculate quote
    let result: any

    if (body.imageBase64) {
      // With image analysis
      result = await calculateQuoteWithImage({
        ...quoteInput,
        imageBase64: body.imageBase64,
      })
    } else {
      // Text-only quote
      result = await calculateQuote(quoteInput)
    }

    // Check for errors
    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          note: 'Try calculating without image or manually adjust parameters',
        },
        { status: 400 }
      )
    }

    // Success response
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Quote API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to calculate quote',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/quote
 * 
 * Get pricing reference information
 */
export async function GET(request: NextRequest) {
  try {
    // Return pricing reference
    return NextResponse.json({
      laborRatesNZD: {
        min: 55,
        mid: 65,
        max: 75,
      },
      conditionLevels: {
        level1: {
          description: 'Wash & Paint',
          prepHoursPerM2: 0.05,
          estimatedCostPerM2: 15,
        },
        level2: {
          description: 'Standard Prep',
          prepHoursPerM2: 0.1,
          estimatedCostPerM2: 20,
        },
        level3: {
          description: 'Heavy Prep (Peeling)',
          prepHoursPerM2: 0.4,
          estimatedCostPerM2: 35,
        },
        level4: {
          description: 'Full Strip',
          prepHoursPerM2: 0.8,
          estimatedCostPerM2: 60,
        },
      },
      accessSurcharges: {
        ground: 0,
        singleStorey: 0,
        twoStorey: 3500,
        threeStoreyPlus: 7500,
      },
      gstRate: 0.15,
      materialCosts: {
        standard: 15,
        premium: 22,
        commercial: 28,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve pricing' },
      { status: 500 }
    )
  }
}
