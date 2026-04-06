'use server'

import { calculateAutoRemovalQuote } from './quote-engine'
import { AutoRemovalQuoteInput, AutoRemovalQuoteResult } from './types'

/**
 * Server action: Calculate auto removal quote for Hobart, Tasmania
 */
export async function getAutoRemovalQuote(
  input: AutoRemovalQuoteInput
): Promise<AutoRemovalQuoteResult> {
  try {
    return calculateAutoRemovalQuote(input)
  } catch (error) {
    return {
      estimatedPayout: { low: 0, mid: 0, high: 0 },
      pickupFee: 0,
      netPayout: 0,
      timeframe: 'Unknown',
      assumptions: [],
      highlights: [],
      error: error instanceof Error ? error.message : 'Failed to calculate quote',
    }
  }
}
