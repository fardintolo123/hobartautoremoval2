// Car removal quote system types for Tasmania market (2026)

export type VehicleCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'nonrunning' | 'damaged'
export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'ute' | 'motorcycle' | 'caravan' | 'other'

export interface VehicleConditionClassification {
  level: VehicleCondition
  description: string
  examples: string[]
  conditionMultiplier: number
}

export interface GeminiVisionAnalysis {
  vehicleType: VehicleType
  estimatedYear: number
  estimatedMileage: number
  conditionLevel: VehicleCondition
  damageAssessment: string
  hasRust: boolean
  hasFluidLeaks: boolean
  hazardousComponents: string[]
  recommendations: string[]
  confidence: number
  imageDescription?: string
  imageSummaries?: GeminiImageSummary[]
  estimatedQuoteAUD?: {
    lowEstimate: number
    highEstimate: number
    midpointEstimate: number
    assumptions: string
  }
}

export interface GeminiImageSummary {
  index: number
  description: string
  confidence: number
  conditionLevel: VehicleCondition
  damageLevel: string
}

export interface QuoteInput {
  vehicleType: VehicleType
  vehicleYear: number
  vehicleCondition: VehicleCondition
  locationPostcode: string
  mileage?: number
  imagesBase64?: string[]
  // Additional Services
  hasHazardousMaterials?: boolean
  needsFluidDraining?: boolean
  needsInternalRemoval?: boolean
  needsDisassembly?: boolean
  towingDistanceKm?: number
}

export interface VehicleConditionClassification {
  level: VehicleCondition
  description: string
  examples: string[]
  conditionMultiplier: number
}

export interface PrepFactorBreakdown {
  baseRemovalFee: number
  conditionMultiplier: number
  totalAdjustedFee: number
  removalCostAUD: number
}

export interface QuoteCalculation {
  vehicleType: VehicleType
  vehicleYear: number
  vehicleCondition: VehicleCondition
  locationPostcode: string
  baseFeeAUD: number
  conditionAdjustmentAUD: number
  conditionMultiplier: number
  locationSurchargeAUD: number
  hazardousMaterialsFeeAUD: number
  fluidDrainingFeeAUD: number
  internalRemovalFeeAUD: number
  disassemblyFeeAUD: number
  towingFeeAUD: number
  subtotalAUD: number
  gstAUD: number
  totalAUD: number
  assumptions: string[]
}

export interface QuoteCalculationResponse extends QuoteCalculation {
  error?: string
  geminiAnalysis?: GeminiVisionAnalysis
  geminiImageSummaries?: GeminiImageSummary[]
}

export const VEHICLE_CONDITIONS: Record<VehicleCondition, VehicleConditionClassification> = {
  excellent: {
    level: 'excellent',
    description: 'Excellent - Running, low mileage, minimal rust/damage',
    examples: ['Recently maintained', 'Clean interior', 'Operational'],
    conditionMultiplier: 1.0,
  },
  good: {
    level: 'good',
    description: 'Good - Running, moderate mileage, minor wear',
    examples: ['Normal wear', 'Functional', '100k-150k km'],
    conditionMultiplier: 0.9,
  },
  fair: {
    level: 'fair',
    description: 'Fair - Running but needs work, visible wear, surface rust',
    examples: ['Higher mileage', 'Cosmetic damage', 'Needs repairs'],
    conditionMultiplier: 0.75,
  },
  poor: {
    level: 'poor',
    description: 'Poor - Non-running or barely running, significant rust/damage',
    examples: ['High mileage', 'Major damage', 'Fuel issues'],
    conditionMultiplier: 0.5,
  },
  nonrunning: {
    level: 'nonrunning',
    description: 'Non-Running - Engine does not start, needs towing',
    examples: ['Engine seized', 'Dead battery', 'Flat tires'],
    conditionMultiplier: 0.4,
  },
  damaged: {
    level: 'damaged',
    description: 'Damaged - Severe structural/mechanical damage, written off',
    examples: ['Collision', 'Fire damage', 'Flood damage'],
    conditionMultiplier: 0.3,
  },
}

// Tasmania 2026 Car Removal Pricing Constants
export const TASMANIA_PRICING_2026 = {
  // Base removal fees by vehicle type (AUD)
  BASE_REMOVAL_FEE: {
    motorcycle: 150,
    sedan: 300,
    ute: 400,
    van: 450,
    suv: 500,
    truck: 600,
    caravan: 800,
    other: 350,
  },
  
  // Location surcharges - Tasmania regional
  LOCATION_SURCHARGES: {
    hobart: 0, // Base location
    launceston: 150,
    devonport: 200,
    burnie: 220,
    regional: 250,
    remote: 400, // North west regions
  },
  
  // Towing distance surcharges
  TOWING_DISTANCE: {
    perKm: 3.5, // Additional $3.50 per km beyond 25km radius
    baseRadius: 25, // Free up to 25km from depot
  },
  
  // Hazmat & special services
  HAZMAT_SURCHARGE: 150, // Fluids, batteries, airbags, etc.
  FLUID_DRAINING_FEE: 75, // Proper fluid disposal
  DISASSEMBLY_SURCHARGE: 200, // Partial removal of parts
  INTERNAL_REMOVAL_SURCHARGE: 100, // Remove from garage/shed
  
  // GST Rate
  GST_RATE: 0.1, // Australian GST 10%
}
