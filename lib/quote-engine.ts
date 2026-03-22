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
   * Typical: 0.3-0.4 hours per m² for application (2-3 coats)
   */
  private calculateApplicationHours(areaM2: number, coats: number = 2): number {
    const hoursPerCoatPerM2 = 0.15 // ~6.67 m²/hour per coat
    return areaM2 * hoursPerCoatPerM2 * coats
  }

  /**
   * HEIGHT PENALTY: Ladder repositioning & safety precautions
   * If 2-storey or height > 5m, add 25% to labor
   */
  private calculateHeightPenalty(
    totalHours: number,
    heightM?: number,
    storeys?: number
  ): number {
    if (!heightM && !storeys) return 0

    const isPeakHeight = (heightM && heightM > 5) || (storeys && storeys >= 2)
    return isPeakHeight ? totalHours * 0.25 : 0
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

    // Access surcharge
    const accessSurchargeNZD = this.calculateAccessSurcharge(
      storeys,
      heightM,
      input.accessMethod
    )

    // Materials
    const materialsCostNZD = this.calculateMaterialsCost(areaM2, input.paintSystem)

    // Subtotal (before GST)
    const subtotalNZD = laborCostNZD + materialsCostNZD + accessSurchargeNZD

    // GST
    const gstNZD = subtotalNZD * NZ_PRICING_2026.GST_RATE
    const totalNZD = subtotalNZD + gstNZD

    // Assumptions for transparency
    const assumptions: string[] = [
      `Area: ${areaM2.toFixed(1)} m²`,
      `Condition: ${CONDITION_LEVELS[conditionLevel].description}`,
      `Paint System: ${input.paintSystem || 'premium'} (${coats} coats)`,
      `Labour hours: ${totalLaborHours.toFixed(1)} hours @ $${this.laborRate}/hr`,
      heightM ? `Height: ${heightM.toFixed(1)}m${heightPenaltyHours > 0 ? ' (+25% height penalty)' : ''}` : '',
      storeys > 1 ? `Access: ${storeys}-storey (includes scaffolding surcharge)` : '',
      'Excludes: Site protection, roof work, lead stripping (if required)',
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
        access: accessSurchargeNZD,
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
