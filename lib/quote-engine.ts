import {
  QuoteInput,
  QuoteCalculation,
  ConditionLevel,
  CONDITION_LEVELS,
  NZ_PRICING_2026,
} from './types'

/**
 * Professional NZ Painter Quote Calculator
 * 
 * Formula:
 * Total = (Area × Base Rate) + (Prep Factor × Labor) + Access Cost + Materials
 *
 * Based on 2026 NZ market rates and WorkSafe health & safety requirements
 */

class PainterQuoteEngine {
  private laborRate: number // NZD/hour

  constructor(laborRate: number = NZ_PRICING_2026.LABOR_RATE_PER_HOUR.mid) {
    this.laborRate = laborRate
  }

  /**
   * CORE ALGORITHM: Estimate labor hours using prep multiplier
   * Professionals think in "Man-Hours", not just square meters
   */
  private calculatePrepHours(areaM2: number, conditionLevel: ConditionLevel): number {
    const condition = CONDITION_LEVELS[conditionLevel]
    return areaM2 * condition.prepHoursPerM2
  }

  /**
   * BASE LABOR: Painting itself (not prep)
   * Professional application time: 0.2 hours per m² per coat (more realistic)
   */
  private calculateApplicationHours(areaM2: number, coats: number = 2): number {
    const hoursPerCoatPerM2 = NZ_PRICING_2026.APPLICATION_HOURS_PER_COAT_PER_M2
    return areaM2 * hoursPerCoatPerM2 * coats
  }

  /**
   * HEIGHT PENALTY: Ladder repositioning & safety precautions
   * If 2-storey, add 15% to labor (not 25% anymore - height surcharge handles 3m+)
   */
  private calculateHeightPenalty(
    totalHours: number,
    heightM?: number,
    storeys?: number
  ): number {
    if (!heightM && !storeys) return 0

    // Only apply hour-based penalty for 2+ storeys when height not explicitly provided
    const isPeakHeight = (storeys && storeys >= 2)
    return isPeakHeight ? totalHours * 0.15 : 0
  }

  /**
   * HEIGHT-BASED SURCHARGE: Fixed cost for access equipment
   * 0-3m: No surcharge (standard ladder)
   * 3-5m: Mobile tower / plank setup = $800
   * 5m+: Professional scaffolding = $2,500
   */
  private calculateHeightSurcharge(heightM?: number): number {
    if (!heightM || heightM <= 3) return 0

    if (heightM <= 5) {
      return NZ_PRICING_2026.HEIGHT_SURCHARGES.height3to5m
    }

    return NZ_PRICING_2026.HEIGHT_SURCHARGES.height5plus
  }

  /**
   * ACCESS SURCHARGE: WorkSafe compliance (height > 2m needs stable platforms)
   * Single storey: $0
   * Two storey: $2,000 - $5,000 (scaffolding/plank setup)
   * Complex: $5,000+ (full scaffolding solution)
   */
  private calculateAccessSurcharge(
    storeys: number,
    heightM?: number,
    accessMethod?: 'ground' | 'single-ladder' | 'scaffolding'
  ): number {
    if (heightM && heightM <= 2) return 0

    if (storeys === 1 && accessMethod === 'ground') return 0
    if (storeys === 1 && accessMethod === 'single-ladder') return 0

    if (storeys === 2) {
      // $2,000 - $5,000 typical for 2-storey
      return NZ_PRICING_2026.ACCESS_SURCHARGE.twoStoreyScaffolding.mid
    }

    if (storeys >= 3 || accessMethod === 'scaffolding') {
      return NZ_PRICING_2026.ACCESS_SURCHARGE.complexScaffolding.mid
    }

    return 0
  }

  /**
   * MATERIAL COST: NZ Premium Paint System
   * Exterior Standard: 1x Spot Prime + 2x Top Coats
   * $15-$22 per m² for premium NZ materials (Resene/Dulux)
   */
  private calculateMaterialsCost(
    areaM2: number,
    paintSystem: 'standard' | 'premium' | 'commercial' = 'premium'
  ): number {
    const costPerM2 = NZ_PRICING_2026.MATERIAL_COST_PER_M2[paintSystem]
    return areaM2 * costPerM2
  }

  /**
   * Main quote calculation
   */
  calculate(input: QuoteInput): QuoteCalculation {
    // Determine area (use Gemini analysis if available, otherwise user input)
    const areaM2 = input.gemminiAnalysis?.estimatedAreaM2 || input.userProvidedAreaM2

    // Determine condition level
    let conditionLevel: ConditionLevel = input.userSelectedCondition || 'level2'
    if (input.gemminiAnalysis) {
      conditionLevel = input.gemminiAnalysis.conditionLevel
    }

    // Determine storey count
    const storeys = input.storeyCount || (input.gemminiAnalysis?.storeys || 1)
    const heightM = input.userEstimatedHeight || input.gemminiAnalysis?.estimatedHeightM

    // Calculate prep labor
    const prepHours = this.calculatePrepHours(areaM2, conditionLevel)
    const prepCostNZD = prepHours * this.laborRate

    // Calculate application labor
    const coats = input.coatsRequired || 2
    const applicationHours = this.calculateApplicationHours(areaM2, coats)

    // Calculate height penalty
    const heightPenaltyHours = this.calculateHeightPenalty(applicationHours, heightM, storeys)

    // Total labor
    const totalLaborHours = prepHours + applicationHours + heightPenaltyHours
    const laborCostNZD = totalLaborHours * this.laborRate

    // Setup fee (site protection, masking, first-day prep)
    const setupFeeNZD = NZ_PRICING_2026.SETUP_FEE

    // Height surcharge (mobile tower, scaffolding for 3m+)
    const heightSurchargeNZD = this.calculateHeightSurcharge(heightM)

    // Access surcharge (for 2+ storeys)
    const accessSurchargeNZD = this.calculateAccessSurcharge(
      storeys,
      heightM,
      input.accessMethod
    )

    // Materials
    const materialsCostNZD = this.calculateMaterialsCost(areaM2, input.paintSystem)

    // Subtotal (before GST) - includes setup fee + height surcharge
    const subtotalNZD = laborCostNZD + materialsCostNZD + setupFeeNZD + heightSurchargeNZD + accessSurchargeNZD

    // GST
    const gstNZD = subtotalNZD * NZ_PRICING_2026.GST_RATE
    const totalNZD = subtotalNZD + gstNZD

    // Assumptions for transparency
    const assumptions: string[] = [
      `Area: ${areaM2.toFixed(1)} m²`,
      `Condition: ${CONDITION_LEVELS[conditionLevel].description}`,
      `Paint System: ${input.paintSystem || 'premium'} (${coats} coats)`,
      `Labour hours: ${totalLaborHours.toFixed(1)} hours @ $${this.laborRate}/hr`,
      heightM ? `Height: ${heightM.toFixed(1)}m${heightSurchargeNZD > 0 ? ` (height surcharge: $${heightSurchargeNZD})` : ''}` : '',
      storeys > 1 ? `Access: ${storeys}-storey (includes scaffolding surcharge: $${accessSurchargeNZD})` : '',
      `Setup & Site Protection: $${setupFeeNZD} (masking, covering, first-day prep work)`,
      'Excludes: Specialist work (roof, gutters, weathertightness repairs, lead stripping)',
    ].filter(Boolean)

    return {
      areaM2,
      prepFactor: {
        baseHoursPerM2: CONDITION_LEVELS[conditionLevel].prepHoursPerM2,
        conditionMultiplier: 1,
        totalPrepHours: prepHours,
        prepCostNZD,
      },
      laborHours: totalLaborHours,
      laborCostNZD,
      accessSurchargeNZD,
      materialsCostNZD,
      subtotalNZD,
      gstNZD,
      totalNZD,
      breakdown: {
        prep: prepCostNZD,
        labor: laborCostNZD - prepCostNZD,
        materials: materialsCostNZD,
        access: accessSurchargeNZD + heightSurchargeNZD + setupFeeNZD,
      },
      assumptions,
    }
  }

  /**
   * Estimate area based on height and width (for missing user data)
   */
  estimateArea(heightM: number, widthM: number): number {
    // Don't subtract windows/doors - "Cutting In" rule
    return heightM * widthM
  }

  /**
   * Set custom labor rate (useful for different pricing tiers)
   */
  setLaborRate(rate: number): void {
    this.laborRate = rate
  }
}

export const createQuoteEngine = (
  laborRate: number = NZ_PRICING_2026.LABOR_RATE_PER_HOUR.mid
) => new PainterQuoteEngine(laborRate)

export default PainterQuoteEngine
