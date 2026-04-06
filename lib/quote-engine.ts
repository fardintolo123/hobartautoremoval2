import {
  QuoteInput,
  QuoteCalculation,
  VehicleCondition,
  VEHICLE_CONDITIONS,
  TASMANIA_PRICING_2026,
} from './types'

/**
 * Professional Tasmania Car Removal Quote Calculator
 *
 * Formula:
 * Total = Base Fee + Condition Adjustment + Location Surcharge + Towing + Hazmat + Fluids
 *
 * Based on 2026 Tasmania market rates and environmental regulations
 */

class CarRemovalQuoteEngine {
  private baseFee: number // AUD

  constructor(baseFee: number = 300) {
    this.baseFee = baseFee
  }

  /**
   * BASE REMOVAL FEE: Vehicle type determines starting price
   */
  private getBaseRemovalFee(vehicleType: string): number {
    return TASMANIA_PRICING_2026.BASE_REMOVAL_FEE[vehicleType as keyof typeof TASMANIA_PRICING_2026.BASE_REMOVAL_FEE] || TASMANIA_PRICING_2026.BASE_REMOVAL_FEE.other
  }

  /**
   * CONDITION ADJUSTMENT: Vehicle condition affects removal complexity
   * Excellent: 100% (no adjustment)
   * Good: 90% (minor discount)
   * Fair: 75% (significant discount)
   * Poor: 50% (major discount)
   * Non-running: 40% (towing required)
   * Damaged: 30% (complex removal)
   */
  private calculateConditionAdjustment(baseFee: number, condition: VehicleCondition): number {
    const conditionData = VEHICLE_CONDITIONS[condition]
    const adjustedFee = baseFee * conditionData.conditionMultiplier
    return adjustedFee - baseFee // Return the adjustment amount (can be negative)
  }

  /**
   * LOCATION SURCHARGE: Tasmania regional pricing
   * Hobart: Base ($0)
   * Launceston: +$150
   * Devonport: +$200
   * Burnie: +$220
   * Regional: +$250
   * Remote: +$400
   */
  private calculateLocationSurcharge(postcode: string): number {
    // Simple postcode-based location detection
    const postcodeNum = parseInt(postcode)

    if (postcodeNum >= 7000 && postcodeNum <= 7019) return TASMANIA_PRICING_2026.LOCATION_SURCHARGES.hobart
    if (postcodeNum >= 7248 && postcodeNum <= 7259) return TASMANIA_PRICING_2026.LOCATION_SURCHARGES.launceston
    if (postcodeNum >= 7300 && postcodeNum <= 7320) return TASMANIA_PRICING_2026.LOCATION_SURCHARGES.devonport
    if (postcodeNum >= 7320 && postcodeNum <= 7325) return TASMANIA_PRICING_2026.LOCATION_SURCHARGES.burnie

    // Remote areas (north west, far south)
    if (postcodeNum >= 7466 && postcodeNum <= 7470) return TASMANIA_PRICING_2026.LOCATION_SURCHARGES.remote

    return TASMANIA_PRICING_2026.LOCATION_SURCHARGES.regional
  }

  /**
   * TOWING SURCHARGE: Distance beyond 25km radius
   * Base radius: 25km free
   * Additional: $3.50 per km
   */
  private calculateTowingSurcharge(distanceKm: number = 0): number {
    const baseRadius = TASMANIA_PRICING_2026.TOWING_DISTANCE.baseRadius
    const perKmRate = TASMANIA_PRICING_2026.TOWING_DISTANCE.perKm

    if (distanceKm <= baseRadius) return 0
    return (distanceKm - baseRadius) * perKmRate
  }

  /**
   * HAZMAT SURCHARGE: Hazardous components
   * Batteries, airbags, mercury switches, etc.
   */
  private calculateHazmatSurcharge(hasHazmat: boolean = false): number {
    return hasHazmat ? TASMANIA_PRICING_2026.HAZMAT_SURCHARGE : 0
  }

  /**
   * FLUID DRAINING SURCHARGE: Proper disposal of fluids
   */
  private calculateFluidDrainingSurcharge(requiresDraining: boolean = false): number {
    return requiresDraining ? TASMANIA_PRICING_2026.FLUID_DRAINING_FEE : 0
  }

  /**
   * INTERNAL REMOVAL SURCHARGE: Remove from garage/shed
   */
  private calculateInternalRemovalSurcharge(requiresInternal: boolean = false): number {
    return requiresInternal ? TASMANIA_PRICING_2026.INTERNAL_REMOVAL_SURCHARGE : 0
  }

  /**
   * DISASSEMBLY SURCHARGE: Partial removal of parts
   */
  private calculateDisassemblySurcharge(requiresDisassembly: boolean = false): number {
    return requiresDisassembly ? TASMANIA_PRICING_2026.DISASSEMBLY_SURCHARGE : 0
  }

  /**
   * Main quote calculation
   */
  calculate(input: QuoteInput): QuoteCalculation {
    // Base fee based on vehicle type
    const baseFeeAUD = this.getBaseRemovalFee(input.vehicleType)

    // Condition adjustment
    const conditionAdjustmentAUD = this.calculateConditionAdjustment(baseFeeAUD, input.vehicleCondition)
    const conditionMultiplier = VEHICLE_CONDITIONS[input.vehicleCondition].conditionMultiplier

    // Location surcharge
    const locationSurchargeAUD = this.calculateLocationSurcharge(input.locationPostcode)

    // Towing surcharge
    const towingFeeAUD = this.calculateTowingSurcharge(input.towingDistanceKm)

    // Hazmat surcharge
    const hazardousMaterialsFeeAUD = this.calculateHazmatSurcharge(input.hasHazardousMaterials)

    // Fluid draining surcharge
    const fluidDrainingFeeAUD = this.calculateFluidDrainingSurcharge(input.needsFluidDraining)

    // Internal removal surcharge
    const internalRemovalFeeAUD = this.calculateInternalRemovalSurcharge(input.needsInternalRemoval)

    // Disassembly surcharge
    const disassemblyFeeAUD = this.calculateDisassemblySurcharge(input.needsDisassembly)

    // Subtotal (before GST)
    const subtotalAUD =
      baseFeeAUD +
      conditionAdjustmentAUD +
      locationSurchargeAUD +
      towingFeeAUD +
      hazardousMaterialsFeeAUD +
      fluidDrainingFeeAUD +
      internalRemovalFeeAUD +
      disassemblyFeeAUD

    // GST (10% for Australia)
    const gstAUD = subtotalAUD * TASMANIA_PRICING_2026.GST_RATE
    const totalAUD = subtotalAUD + gstAUD

    // Assumptions for transparency
    const assumptions: string[] = [
      `Vehicle: ${input.vehicleYear} ${input.vehicleType.charAt(0).toUpperCase() + input.vehicleType.slice(1)}`,
      `Condition: ${VEHICLE_CONDITIONS[input.vehicleCondition].description}`,
      `Location: ${input.locationPostcode} (Tasmania)`,
      `Base removal fee: $${baseFeeAUD} (${input.vehicleType})`,
      conditionAdjustmentAUD !== 0 ? `Condition adjustment: ${conditionAdjustmentAUD > 0 ? '+' : ''}$${conditionAdjustmentAUD.toFixed(0)} (${input.vehicleCondition})` : '',
      locationSurchargeAUD > 0 ? `Location surcharge: $${locationSurchargeAUD} (${input.locationPostcode})` : '',
      towingFeeAUD > 0 ? `Towing surcharge: $${towingFeeAUD.toFixed(0)} (${input.towingDistanceKm}km beyond ${TASMANIA_PRICING_2026.TOWING_DISTANCE.baseRadius}km radius)` : '',
      hazardousMaterialsFeeAUD > 0 ? `Hazardous materials surcharge: $${hazardousMaterialsFeeAUD} (batteries, airbags, etc.)` : '',
      fluidDrainingFeeAUD > 0 ? `Fluid draining surcharge: $${fluidDrainingFeeAUD} (proper disposal)` : '',
      internalRemovalFeeAUD > 0 ? `Internal removal surcharge: $${internalRemovalFeeAUD} (garage/shed access)` : '',
      disassemblyFeeAUD > 0 ? `Disassembly surcharge: $${disassemblyFeeAUD} (partial dismantling)` : '',
      'Includes: Vehicle collection, environmental compliance, recycling/disposal',
      'Excludes: Title transfer fees, registration cancellation, storage fees',
      'GST: 10% (Australian standard)',
      'Payment terms: Cash on collection or bank transfer',
    ].filter(Boolean)

    return {
      vehicleType: input.vehicleType,
      vehicleYear: input.vehicleYear,
      vehicleCondition: input.vehicleCondition,
      locationPostcode: input.locationPostcode,
      baseFeeAUD,
      conditionAdjustmentAUD,
      conditionMultiplier,
      locationSurchargeAUD,
      hazardousMaterialsFeeAUD,
      fluidDrainingFeeAUD,
      internalRemovalFeeAUD,
      disassemblyFeeAUD,
      towingFeeAUD,
      subtotalAUD,
      gstAUD,
      totalAUD,
      assumptions,
    }
  }

  /**
   * Set custom base fee (useful for different pricing tiers)
   */
  setBaseFee(fee: number): void {
    this.baseFee = fee
  }
}

export const createQuoteEngine = (
  baseFee: number = 300
) => new CarRemovalQuoteEngine(baseFee)

export default CarRemovalQuoteEngine
