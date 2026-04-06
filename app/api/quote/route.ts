import { NextRequest, NextResponse } from 'next/server'
import { calculateQuoteWithImage, calculateQuote } from '@/lib/quote-actions'
import { QuoteInput } from '@/lib/types'

/**
 * POST /api/quote
 * 
 * Calculate a car removal quote with optional image analysis
 * 
 * Request body:
 * {
 *   vehicleType: VehicleType,
 *   vehicleYear: number,
 *   vehicleCondition: VehicleCondition,
 *   locationPostcode: string,
 *   mileage?: number,
 *   imagesBase64?: string[],         // Array of base64 encoded images
 *   hasHazardousMaterials?: boolean,
 *   needsFluidDraining?: boolean,
 *   needsInternalRemoval?: boolean,
 *   needsDisassembly?: boolean,
 *   towingDistanceKm?: number
 * }
 * 
 * Response:
 * {
 *   vehicleType: VehicleType,
 *   vehicleYear: number,
 *   vehicleCondition: VehicleCondition,
 *   locationPostcode: string,
 *   baseFeeAUD: number,
 *   conditionAdjustmentAUD: number,
 *   locationSurchargeAUD: number,
 *   hazardousMaterialsFeeAUD: number,
 *   fluidDrainingFeeAUD: number,
 *   internalRemovalFeeAUD: number,
 *   disassemblyFeeAUD: number,
 *   towingFeeAUD: number,
 *   subtotalAUD: number,
 *   gstAUD: number,
 *   totalAUD: number,
 *   assumptions: string[],
 *   geminiAnalysis?: GeminiVisionAnalysis,
 *   geminiImageSummaries?: GeminiImageSummary[],
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    if (!body.vehicleType || !body.vehicleYear || !body.vehicleCondition || !body.locationPostcode) {
      return NextResponse.json(
        { error: 'vehicleType, vehicleYear, vehicleCondition, and locationPostcode are required' },
        { status: 400 }
      )
    }

    // Rate limiting (basic - check client IP)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    console.log(`Car removal quote request from IP: ${clientIp}`)

    // Prepare input
    const quoteInput: QuoteInput = {
      vehicleType: body.vehicleType,
      vehicleYear: parseInt(body.vehicleYear),
      vehicleCondition: body.vehicleCondition,
      locationPostcode: body.locationPostcode,
      mileage: body.mileage ? parseInt(body.mileage) : undefined,
      imagesBase64: body.imagesBase64,
      hasHazardousMaterials: body.hasHazardousMaterials || false,
      needsFluidDraining: body.needsFluidDraining || false,
      needsInternalRemoval: body.needsInternalRemoval || false,
      needsDisassembly: body.needsDisassembly || false,
      towingDistanceKm: body.towingDistanceKm ? parseFloat(body.towingDistanceKm) : 0,
    }

    // Calculate quote
    let result: any

    if (body.imagesBase64 && body.imagesBase64.length > 0) {
      // With image analysis
      result = await calculateQuoteWithImage(quoteInput)
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
