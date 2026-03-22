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
  
  // Legal & Safety - NZ Compliance
  builtBefore1970?: boolean // Lead paint testing & removal
  includesLeadRemoval?: boolean
  
  // Coastal considerations
  withinCoastal500m?: boolean // Salt wash & high-build primer required
  
  // Surface condition extreme
  hasExtensiveFlaking?: boolean // Full strip (bubbling/flaking to wood)
  
  // Additional items
  includesSoffitsFascias?: boolean
  soffisFasciasAreaM2?: number
  joineryType?: 'timber' | 'aluminum' | 'mixed' | 'none' // Timber windows add 30+ hrs
  numTimberFrames?: number
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
  
  // New NZ Compliance & Hidden Costs
  leadRemovalCostNZD: number
  coastalSurchargeCostNZD: number
  soffisFasciasCostNZD: number
  joineryWorkCostNZD: number
  
  subtotalNZD: number
  gstNZD: number
  totalNZD: number
  breakdown: {
    prep: number
    labor: number
    materials: number
    access: number
    compliance: number // Lead removal + coastal surcharge
    additionalWorks: number // Soffits/fascias + joinery
  }
  assumptions: string[]
}

export const CONDITION_LEVELS: Record<ConditionLevel, ConditionClassification> = {
  level1: {
    level: 'level1',
    description: 'Wash & Paint - Smooth surface, no fading',
    prepHoursPerM2: 0.15,
    examples: ['Recently painted', 'Good condition', 'Minor dust only'],
  },
  level2: {
    level: 'level2',
    description: 'Standard Prep - Minor fading, light sanding required',
    prepHoursPerM2: 0.25,
    examples: ['Slight fading', 'Minor weathering', '1-3 year old paint'],
  },
  level3: {
    level: 'level3',
    description: 'Heavy Prep - Visible peeling, needs scraping/spot priming',
    prepHoursPerM2: 0.6,
    examples: ['Visible peeling', 'Flaking paint', 'Coating failure', 'Weatherboard exposure'],
  },
  level4: {
    level: 'level4',
    description: 'Full Strip - Major coating failure, needs heat-gun stripping',
    prepHoursPerM2: 1.1,
    examples: ['Complete failure', 'Multiple layers failing', 'Rust/mold damage'],
  },
}

// NZ 2026 Pricing Constants
export const NZ_PRICING_2026 = {
  LABOR_RATE_PER_HOUR: { min: 55, mid: 65, max: 75 }, // NZD
  MATERIAL_COST_PER_M2: { standard: 15, premium: 22, commercial: 28 }, // NZD
  SETUP_FEE: 350, // Fixed fee for site protection, masking, setup - first day work
  HEIGHT_SURCHARGES: {
    under3m: 0,
    height3to5m: 800, // Mobile tower/plank setup for 3-5m heights
    height5plus: 2500, // Complex scaffolding for 5m+
  },
  ACCESS_SURCHARGE: {
    ground: 0,
    singleLadder: 0,
    twoStoreyScaffolding: { min: 2000, mid: 3500, max: 5000 },
    complexScaffolding: { min: 5000, mid: 7500, max: 10000 },
  },
  APPLICATION_HOURS_PER_COAT_PER_M2: 0.2, // More realistic coating time (was 0.15)
  
  // Legal & Safety - NZ Compliance (Issue #1)
  LEAD_PAINT: {
    testingFee: 400, // Lead testing kit & lab analysis
    removalHoursPerM2: 0.5, // Wet-strip removal is labor-intensive
    hazmatDisposalPerLoad: 300, // Sealed waste disposal
    costPerM2: 15, // Additional materials (primers, sealants)
  },
  
  // Coastal Surcharge - Common in Auckland/Newcastle
  COASTAL_SURCHARGE: {
    saltWashPrep: 600, // Pre-wash for salt removal
    highBuildPrimerPerM2: 8, // Thicker primer for coastal
    additionalCoatPerM2: 5, // Salt deterioration requires extra coat
  },
  
  // Hidden Cost Items
  SOFFITS_FASCIAS: {
    hoursPerM2: 0.6, // More detailed work than walls
    materialCostPerM2: { standard: 8, premium: 14, commercial: 18 }, // Different paint/finishes
  },
  JOINERY_WORK: {
    timberFrame: 2.5, // Hours per frame (complex masking, cutting in, drying)
    aluminiumFrame: 0.3, // Much faster (no absorption, spray-friendly)
    estimatedFramesPerWindow: 0.5, // Partial doors/transom glazed areas
  },
  
  GST_RATE: 0.15,
  DOOR_HEIGHT_M: 1.98, // Standard NZ external door for reference scaling
  WEATHERBOARD_WIDTH_MM: 150,
}

export const CUTTING_IN_NO_SUBTRACT = true // Pro rule: Don't subtract windows/doors
