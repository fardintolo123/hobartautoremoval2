import {
  AutoRemovalQuoteInput,
  AutoRemovalQuoteResult,
  TAS_AUTO_REMOVAL_PRICING,
  LOCATION_ZONE_LABELS,
  VEHICLE_TYPE_LABELS,
  VEHICLE_CONDITION_LABELS,
} from './types'

export function calculateAutoRemovalQuote(input: AutoRemovalQuoteInput): AutoRemovalQuoteResult {
  const pricing = TAS_AUTO_REMOVAL_PRICING

  // 1. Base payout for vehicle type
  const basePayout = pricing.BASE_PAYOUT[input.vehicleType]

  // 2. Condition multiplier
  const conditionMult = pricing.CONDITION_MULTIPLIER[input.vehicleCondition]

  // 3. Age factor
  const currentYear = new Date().getFullYear()
  const year = parseInt(input.vehicleYear) || 2010
  const age = currentYear - year
  let ageFactor = pricing.AGE_FACTOR.age10to20
  if (age < 5) ageFactor = pricing.AGE_FACTOR.under5
  else if (age < 10) ageFactor = pricing.AGE_FACTOR.age5to10
  else if (age > 20) ageFactor = pricing.AGE_FACTOR.over20

  // 4. Adjust payout range
  let low = Math.round(basePayout.low * conditionMult * ageFactor)
  let mid = Math.round(basePayout.mid * conditionMult * ageFactor)
  let high = Math.round(basePayout.high * conditionMult * ageFactor)

  // 5. Bonuses / penalties
  if (input.hasTitle) {
    low += pricing.HAS_TITLE_BONUS
    mid += pricing.HAS_TITLE_BONUS
    high += pricing.HAS_TITLE_BONUS
  }
  if (input.requiresSameDayPickup) {
    low += pricing.SAME_DAY_SURCHARGE
    mid += pricing.SAME_DAY_SURCHARGE
    high += pricing.SAME_DAY_SURCHARGE
  }
  if (input.hasHazardousFluid) {
    low += pricing.HAZARDOUS_SURCHARGE
    mid += pricing.HAZARDOUS_SURCHARGE
    high += pricing.HAZARDOUS_SURCHARGE
  }

  // Ensure minimums
  low = Math.max(low, 50)
  mid = Math.max(mid, 100)
  high = Math.max(high, 150)

  // 6. Pickup fee
  const pickupFee = pricing.PICKUP_FEE[input.locationZone]

  // 7. Net payout (mid estimate minus pickup fee)
  const netPayout = Math.max(mid - pickupFee, 0)

  // 8. Timeframe
  let timeframe = 'Within 24–48 hours'
  if (input.requiresSameDayPickup) timeframe = 'Same day (subject to availability)'
  else if (input.locationZone === 'north_tasmania') timeframe = 'Within 2–3 business days'

  // 9. Assumptions & highlights
  const assumptions: string[] = [
    `Vehicle type: ${VEHICLE_TYPE_LABELS[input.vehicleType]}`,
    `Condition: ${VEHICLE_CONDITION_LABELS[input.vehicleCondition]}`,
    `Year: ${input.vehicleYear || 'Not specified'}`,
    `Location: ${LOCATION_ZONE_LABELS[input.locationZone]}`,
    `Pickup fee: ${pickupFee === 0 ? 'FREE' : `$${pickupFee}`}`,
    'Final offer confirmed at time of pickup upon inspection.',
    'All prices include GST.',
  ]

  const highlights: string[] = []
  if (pickupFee === 0) highlights.push('✅ FREE towing & pickup included')
  if (input.vehicleCondition === 'running') highlights.push('🚗 Running vehicles attract higher offers')
  if (input.hasTitle) highlights.push('📄 Clean title adds value to your quote')
  if (input.requiresSameDayPickup) highlights.push('⚡ Same-day pickup available on request')
  highlights.push('💰 Cash paid on the spot at pickup')
  highlights.push('♻️ Environmentally responsible recycling')

  return {
    estimatedPayout: { low, mid, high },
    pickupFee,
    netPayout,
    timeframe,
    assumptions,
    highlights,
  }
}
