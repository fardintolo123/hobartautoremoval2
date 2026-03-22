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
   * HEIGHT-BASED SURCHARGE: Fixed cost for access equipment (NZ WorkSafe 3m Rule)
   * 0-3m: No surcharge (standard ladder)
   * 3-3.2m: Mobile tower/plank setup = $800
   * 3.2-5m: Specialist mobile tower + higher complexity = $1,500
   * 5m+: Professional scaffolding = $2,500
   */
  private calculateHeightSurcharge(heightM?: number): number {
    if (!heightM || heightM <= 3) return 0

    if (heightM <= 3.2) {
      return NZ_PRICING_2026.HEIGHT_SURCHARGES.height3to3_2m
    }

    if (heightM <= 5) {
      return NZ_PRICING_2026.HEIGHT_SURCHARGES.height3_2to5m
    }

    return NZ_PRICING_2026.HEIGHT_SURCHARGES.height5plus
  }

  /**
   * Get height surcharge label for display
   */
  private getHeightSurchargeLabel(heightM?: number): string {
    if (!heightM || heightM <= 3) return ''

    if (heightM <= 3.2) {
      return 'Mobile Tower Setup (3-3.2m)'
    }

    if (heightM <= 5) {
      return 'Specialist Mobile Tower (3.2-5m)'
    }

    return 'Full Scaffolding (5m+)'
  }

  /**
   * ESTIMATE PROJECT DURATION
   * Based on: total prep + application hours, crew size, and realistic daily capacity
   * 
   * For weatherboards especially, crews need buffer for weather, drying time
   * Standard crew: 2 painters = ~35 m²/day (includes all prep, drying)
   */
  private calculateEstimatedProjectDays(
    areaM2: number,
    crewSize: number = NZ_PRICING_2026.CREW_TIMELINE.standardCrewSize
  ): number {
    const productionRatePerDay = NZ_PRICING_2026.CREW_TIMELINE.productionRatePerDay
    const daysRequired = areaM2 / productionRatePerDay
    
    // Round up and add minimal buffer (already built into production rate)
    return Math.ceil(daysRequired)
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
   * LEGAL & SAFETY: Lead Paint Removal (Pre-1970s homes)
   * NZ WorkSafe requirement: Wet-strip removal, hazmat disposal
   * Cost: Testing ($400) + Labor ($15-$50/m²) + Disposal ($300/load)
   */
  private calculateLeadRemovalCost(areaM2: number, includesRemoval: boolean = false): number {
    if (!includesRemoval) return 0

    const testingFee = NZ_PRICING_2026.LEAD_PAINT.testingFee
    const laborHours = areaM2 * NZ_PRICING_2026.LEAD_PAINT.removalHoursPerM2
    const laborCost = laborHours * this.laborRate
    const materialsCost = areaM2 * NZ_PRICING_2026.LEAD_PAINT.costPerM2
    const hazmatDisposal = NZ_PRICING_2026.LEAD_PAINT.hazmatDisposalPerLoad

    return testingFee + laborCost + materialsCost + hazmatDisposal
  }

  /**
   * COASTAL SURCHARGE: Salt wash & high-build primer
   * Common in Auckland/Northland within 500m of coast
   * Adds: Pre-wash ($600) + Extra primer ($8/m²) + Additional coat prep
   */
  private calculateCoastalSurcharge(areaM2: number, isCoastal: boolean = false): number {
    if (!isCoastal) return 0

    const saltWashPrep = NZ_PRICING_2026.COASTAL_SURCHARGE.saltWashPrep
    const highBuildPrimerCost = areaM2 * NZ_PRICING_2026.COASTAL_SURCHARGE.highBuildPrimerPerM2
    const additionalCoatMaterial = areaM2 * NZ_PRICING_2026.COASTAL_SURCHARGE.additionalCoatPerM2

    // Additional prep labor for coastal (0.1 hrs/m² extra)
    const additionalLaborHours = areaM2 * 0.1
    const additionalLaborCost = additionalLaborHours * this.laborRate

    return saltWashPrep + highBuildPrimerCost + additionalCoatMaterial + additionalLaborCost
  }

  /**
   * SOFFITS & FASCIAS: Detailed trim work
   * Often different color than walls, requires detailed cutting in
   * Labor-intensive: 0.6 hrs/m² vs 0.2 hrs/m² for walls
   */
  private calculateSoffisFasciasCost(
    soffisFasciasAreaM2: number,
    paintSystem: 'standard' | 'premium' | 'commercial' = 'premium'
  ): number {
    if (!soffisFasciasAreaM2 || soffisFasciasAreaM2 === 0) return 0

    // Labor: 0.6 hrs/m² for detailed trim work + 2 coats
    const hoursPerM2 = NZ_PRICING_2026.SOFFITS_FASCIAS.hoursPerM2
    const totalHours = soffisFasciasAreaM2 * hoursPerM2 * 2 // Assume 2 coats
    const laborCost = totalHours * this.laborRate

    // Materials: Different paint for trim (may be premium)
    const materialCostPerM2 = NZ_PRICING_2026.SOFFITS_FASCIAS.materialCostPerM2[paintSystem]
    const materialsCost = soffisFasciasAreaM2 * materialCostPerM2

    return laborCost + materialsCost
  }

  /**
   * JOINERY WORK: Windows & doors (timber vs aluminum)
   * Timber frames: 2.5 hrs each (complex masking, cutting in, drying between coats)
   * Aluminum: 0.3 hrs each (no absorption, much faster)
   * Professional estimates: 12 timber windows can add 30+ hours
   */
  private calculateJoineryWorkCost(
    joineryType: 'timber' | 'aluminum' | 'mixed' | 'none' = 'none',
    numTimberFrames: number = 0
  ): number {
    if (joineryType === 'none' || numTimberFrames === 0) return 0

    let laborHours = 0
    let materialsCost = 0

    if (joineryType === 'timber') {
      // Assume all frames are timber
      laborHours = numTimberFrames * NZ_PRICING_2026.JOINERY_WORK.timberFrame
      materialsCost = numTimberFrames * 15 // Primer + undercoat + topcoat materials
    } else if (joineryType === 'aluminum') {
      // Aluminum windows (spray-friendly, no prep needed)
      laborHours = numTimberFrames * NZ_PRICING_2026.JOINERY_WORK.aluminiumFrame
      materialsCost = numTimberFrames * 5 // Minimal materials
    } else if (joineryType === 'mixed') {
      // Assume 70% timber, 30% aluminum
      const timberFrames = Math.round(numTimberFrames * 0.7)
      const aluminiumFrames = numTimberFrames - timberFrames
      laborHours =
        timberFrames * NZ_PRICING_2026.JOINERY_WORK.timberFrame +
        aluminiumFrames * NZ_PRICING_2026.JOINERY_WORK.aluminiumFrame
      materialsCost = timberFrames * 15 + aluminiumFrames * 5
    }

    return laborHours * this.laborRate + materialsCost
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

    // NZ COMPLIANCE & HIDDEN COSTS (Issue #1)
    const leadRemovalCostNZD = this.calculateLeadRemovalCost(
      areaM2,
      input.builtBefore1970 && input.includesLeadRemoval
    )

    const coastalSurchargeCostNZD = this.calculateCoastalSurcharge(
      areaM2,
      input.withinCoastal500m
    )

    const soffisFasciasCostNZD = this.calculateSoffisFasciasCost(
      input.soffisFasciasAreaM2 || 0,
      input.paintSystem
    )

    const joineryWorkCostNZD = this.calculateJoineryWorkCost(
      input.joineryType,
      input.numTimberFrames || 0
    )

    // Subtotal (before GST) - includes all costs
    const subtotalNZD =
      laborCostNZD +
      materialsCostNZD +
      setupFeeNZD +
      heightSurchargeNZD +
      accessSurchargeNZD +
      leadRemovalCostNZD +
      coastalSurchargeCostNZD +
      soffisFasciasCostNZD +
      joineryWorkCostNZD

    // GST
    const gstNZD = subtotalNZD * NZ_PRICING_2026.GST_RATE
    const totalNZD = subtotalNZD + gstNZD

    // Calculate project timeline
    const estimatedDays = this.calculateEstimatedProjectDays(areaM2)
    const heightSurchargeLabel = this.getHeightSurchargeLabel(heightM)

    // Assumptions for transparency
    const assumptions: string[] = [
      `Area: ${areaM2.toFixed(1)} m²`,
      `Condition: ${CONDITION_LEVELS[conditionLevel].description}`,
      `Paint System: ${input.paintSystem || 'premium'} (${coats} coats)`,
      `Labour hours: ${totalLaborHours.toFixed(1)} hours @ $${this.laborRate}/hr`,
      `Project Duration: ~${estimatedDays} working days with 2-painter crew (weather dependent)`,
      `Standard Crew: ${NZ_PRICING_2026.CREW_TIMELINE.standardCrewSize} professional painters (~${NZ_PRICING_2026.CREW_TIMELINE.productionRatePerDay}m²/day capacity)`,
      heightM ? `Height: ${heightM.toFixed(1)}m${heightSurchargeLabel ? ` (${heightSurchargeLabel}: $${heightSurchargeNZD})` : ''}` : '',
      storeys > 1 ? `Access: ${storeys}-storey (includes scaffolding surcharge: $${accessSurchargeNZD})` : '',
      `Setup & Site Protection: $${setupFeeNZD} (masking, covering, first-day prep work)`,
      input.builtBefore1970 && input.includesLeadRemoval ? `Lead paint removal: $${leadRemovalCostNZD.toFixed(0)} (testing, wet-strip, hazmat disposal)` : '',
      input.withinCoastal500m ? `Coastal surcharge: $${coastalSurchargeCostNZD.toFixed(0)} (salt wash, high-build primer, extra coat)` : '',
      input.includesSoffitsFascias ? `Soffits & Fascias: $${soffisFasciasCostNZD.toFixed(0)} (${input.soffisFasciasAreaM2?.toFixed(1)}m² @ $${(soffisFasciasCostNZD / (input.soffisFasciasAreaM2 || 1)).toFixed(0)}/m²)` : '',
      input.joineryType && input.joineryType !== 'none' ? `Joinery work (${input.numTimberFrames || 0} ${input.joineryType} frames): $${joineryWorkCostNZD.toFixed(0)}` : '',
      'Excludes: Rotten timber replacement (subject to site inspection), roof/gutter work, weathertightness repairs',
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
      leadRemovalCostNZD,
      coastalSurchargeCostNZD,
      soffisFasciasCostNZD,
      joineryWorkCostNZD,
      subtotalNZD,
      gstNZD,
      totalNZD,
      breakdown: {
        prep: prepCostNZD,
        labor: laborCostNZD - prepCostNZD,
        materials: materialsCostNZD,
        access: accessSurchargeNZD + heightSurchargeNZD + setupFeeNZD,
        compliance: leadRemovalCostNZD + coastalSurchargeCostNZD,
        additionalWorks: soffisFasciasCostNZD + joineryWorkCostNZD,
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
