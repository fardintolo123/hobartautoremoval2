// Painting quote system types for NZ market (2026)

export type ConditionLevel = 'level1' | 'level2' | 'level3' | 'level4'

export interface ConditionClassification {
  level: ConditionLevel
  description: string
  prepHoursPerM2: number
  examples: string[]
}

export interface GeminiVisionAnalysis {
  claddingType: string
  estimatedHeightM: number
  estimatedAreaM2: number
  coatingFailurePercentage: number
  conditionLevel: ConditionLevel
  storeys: number
  hasSecondFloor: boolean
  accessDifficulty: 'ground' | 'single-ladder' | 'complex-scaffold'
  recommendations: string[]
  confidence: number
}

export interface QuoteInput {
  userProvidedAreaM2: number
  userEstimatedHeight?: number
  userSelectedCondition?: ConditionLevel
  imagePath?: string
  gemminiAnalysis?: GeminiVisionAnalysis
  paintSystem?: 'standard' | 'premium' | 'commercial'
  coatsRequired?: number
  accessMethod?: 'ground' | 'single-ladder' | 'scaffolding'
  storeyCount?: number
}

export interface PrepFactorBreakdown {
  baseHoursPerM2: number
  conditionMultiplier: number
  totalPrepHours: number
  prepCostNZD: number
}

export interface QuoteCalculation {
  areaM2: number
  prepFactor: PrepFactorBreakdown
  laborHours: number
  laborCostNZD: number
  accessSurchargeNZD: number
  materialsCostNZD: number
  subtotalNZD: number
  gstNZD: number
  totalNZD: number
  breakdown: {
    prep: number
    labor: number
    materials: number
    access: number
  }
  assumptions: string[]
}

export const CONDITION_LEVELS: Record<ConditionLevel, ConditionClassification> = {
  level1: {
    level: 'level1',
    description: 'Wash & Paint - Smooth surface, no fading',
    prepHoursPerM2: 0.05,
    examples: ['Recently painted', 'Good condition', 'Minor dust only'],
  },
  level2: {
    level: 'level2',
    description: 'Standard Prep - Minor fading, light sanding required',
    prepHoursPerM2: 0.1,
    examples: ['Slight fading', 'Minor weathering', '1-3 year old paint'],
  },
  level3: {
    level: 'level3',
    description: 'Heavy Prep - Visible peeling, needs scraping/spot priming',
    prepHoursPerM2: 0.4,
    examples: ['Visible peeling', 'Flaking paint', 'Coating failure', 'Weatherboard exposure'],
  },
  level4: {
    level: 'level4',
    description: 'Full Strip - Major coating failure, needs heat-gun stripping',
    prepHoursPerM2: 0.8,
    examples: ['Complete failure', 'Multiple layers failing', 'Rust/mold damage'],
  },
}

// NZ 2026 Pricing Constants
export const NZ_PRICING_2026 = {
  LABOR_RATE_PER_HOUR: { min: 55, mid: 65, max: 75 }, // NZD
  MATERIAL_COST_PER_M2: { standard: 15, premium: 22, commercial: 28 }, // NZD
  ACCESS_SURCHARGE: {
    ground: 0,
    singleLadder: 0,
    twoStoreyScaffolding: { min: 2000, mid: 3500, max: 5000 },
    complexScaffolding: { min: 5000, mid: 7500, max: 10000 },
  },
  GST_RATE: 0.15,
  DOOR_HEIGHT_M: 1.98, // Standard NZ external door for reference scaling
  WEATHERBOARD_WIDTH_MM: 150,
}

export const CUTTING_IN_NO_SUBTRACT = true // Pro rule: Don't subtract windows/doors
