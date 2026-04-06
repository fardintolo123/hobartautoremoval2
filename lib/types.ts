// Auto Removal Quote System - Hobart, Tasmania (2026)

export type VehicleType = 'sedan' | 'suv_4wd' | 'ute_truck' | 'van' | 'motorcycle' | 'bus_truck' | 'caravan_trailer'

export type VehicleCondition = 'running' | 'not_running' | 'damaged' | 'stripped' | 'unknown'

export type LocationZone = 'hobart_metro' | 'greater_hobart' | 'south_tasmania' | 'north_tasmania'

export interface AutoRemovalQuoteInput {
  vehicleType: VehicleType
  vehicleCondition: VehicleCondition
  vehicleYear: string
  vehicleMake: string
  locationZone: LocationZone
  hasTitle: boolean
  isOnPrivateProperty: boolean
  requiresSameDayPickup: boolean
  hasHazardousFluid: boolean
}

export interface AutoRemovalQuoteResult {
  estimatedPayout: {
    low: number
    mid: number
    high: number
  }
  pickupFee: number
  netPayout: number
  timeframe: string
  assumptions: string[]
  highlights: string[]
  error?: string
}

// Tasmania 2026 Auto Removal Pricing
export const TAS_AUTO_REMOVAL_PRICING = {
  // Base scrap metal payout by vehicle type (AUD)
  BASE_PAYOUT: {
    sedan: { low: 200, mid: 350, high: 500 },
    suv_4wd: { low: 300, mid: 500, high: 750 },
    ute_truck: { low: 280, mid: 470, high: 700 },
    van: { low: 250, mid: 420, high: 620 },
    motorcycle: { low: 80, mid: 150, high: 250 },
    bus_truck: { low: 500, mid: 900, high: 1500 },
    caravan_trailer: { low: 150, mid: 280, high: 450 },
  },

  // Condition multipliers
  CONDITION_MULTIPLIER: {
    running: 1.4,       // Running vehicles worth more (parts value)
    not_running: 1.0,   // Base rate
    damaged: 0.8,       // Damaged / accident write-off
    stripped: 0.5,      // Already stripped of parts
    unknown: 0.9,
  },

  // Age bonuses/penalties
  AGE_FACTOR: {
    under5: 1.3,        // 2021+: higher parts value
    age5to10: 1.1,      // 2016-2020
    age10to20: 1.0,     // 2006-2015: standard
    over20: 0.85,       // Pre-2006: mostly scrap metal
  },

  // Location zone pickup fees (AUD)
  PICKUP_FEE: {
    hobart_metro: 0,          // Free pickup in metro Hobart
    greater_hobart: 0,        // Free within Greater Hobart
    south_tasmania: 50,       // Small surcharge outside metro
    north_tasmania: 120,      // North TAS (Launceston area)
  },

  // Bonuses
  HAS_TITLE_BONUS: 50,         // Clean title adds value
  SAME_DAY_SURCHARGE: -30,     // Same-day pickup may reduce offer slightly
  HAZARDOUS_SURCHARGE: -40,    // Hazardous fluids cost more to process

  GST_INCLUDED: true,          // All prices include GST
}

export const LOCATION_ZONE_LABELS: Record<LocationZone, string> = {
  hobart_metro: 'Hobart Metro (CBD, Sandy Bay, Glenorchy)',
  greater_hobart: 'Greater Hobart (Clarence, Kingborough, Derwent Valley)',
  south_tasmania: 'Southern Tasmania (Huon Valley, Channel, Sorell)',
  north_tasmania: 'Northern Tasmania (Launceston, Devonport, Burnie)',
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: 'Car / Sedan / Hatchback',
  suv_4wd: 'SUV / 4WD / Crossover',
  ute_truck: 'Ute / Light Truck',
  van: 'Van / People Mover',
  motorcycle: 'Motorcycle / Scooter',
  bus_truck: 'Bus / Heavy Truck',
  caravan_trailer: 'Caravan / Trailer',
}

export const VEHICLE_CONDITION_LABELS: Record<VehicleCondition, string> = {
  running: 'Running & Drives',
  not_running: 'Not Running (Engine Issues)',
  damaged: 'Accident Damaged / Written Off',
  stripped: 'Already Stripped / Parts Removed',
  unknown: 'Unknown / Unsure',
}
