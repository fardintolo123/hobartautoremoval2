import { ConditionLevel, CONDITION_LEVELS, GeminiVisionAnalysis } from './types'

/**
 * Condition Classification Utilities
 * Helper functions for determining and validating paint condition levels
 */

/**
 * Determine condition level based on visual inspection parameters
 */
export function classifyConditionFromVisuals(
  coatingFailurePercentage: number,
  hasPeeling: boolean,
  hasFlaking: boolean,
  hasRust: boolean,
  hasMold: boolean
): ConditionLevel {
  if (hasRust || hasMold || coatingFailurePercentage > 50) {
    return 'level4'
  }

  if (hasPeeling || hasFlaking || coatingFailurePercentage > 20) {
    return 'level3'
  }

  if (coatingFailurePercentage > 5) {
    return 'level2'
  }

  return 'level1'
}

/**
 * Get prep cost estimate for a condition level
 */
export function getPrepCostEstimate(
  areaM2: number,
  conditionLevel: ConditionLevel,
  laborRatePerHour: number = 65
): number {
  const condition = CONDITION_LEVELS[conditionLevel]
  const hours = areaM2 * condition.prepHoursPerM2
  return hours * laborRatePerHour
}

/**
 * Get time estimate for prep work
 */
export function getPrepTimeEstimate(
  areaM2: number,
  conditionLevel: ConditionLevel
): { hours: number; workDays: number } {
  const condition = CONDITION_LEVELS[conditionLevel]
  const hours = areaM2 * condition.prepHoursPerM2
  const workDays = Math.ceil(hours / 8) // 8-hour work days

  return { hours, workDays }
}

/**
 * Validate Gemini analysis response
 */
export function validateGeminiAnalysis(analysis: GeminiVisionAnalysis): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (analysis.confidence < 50) {
    issues.push(`Low confidence: ${analysis.confidence}%`)
  }

  if (!analysis.claddingType) {
    issues.push('Cladding type not identified')
  }

  if (analysis.estimatedAreaM2 <= 0) {
    issues.push('Invalid area estimate')
  }

  if (analysis.estimatedHeightM <= 0) {
    issues.push('Invalid height estimate')
  }

  if (!['level1', 'level2', 'level3', 'level4'].includes(analysis.conditionLevel)) {
    issues.push('Invalid condition level')
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Calculate area correction factor
 * Shows how much Gemini corrected the user estimate
 */
export function calculateAreaCorrectionFactor(
  userEstimateM2: number,
  gemminiEstimateM2: number
): {
  factor: number
  percentChange: number
  recommendation: string
} {
  if (userEstimateM2 === 0) {
    return {
      factor: 1,
      percentChange: 0,
      recommendation: 'Using AI estimate (no user input provided)',
    }
  }

  const factor = gemminiEstimateM2 / userEstimateM2
  const percentChange = ((gemminiEstimateM2 - userEstimateM2) / userEstimateM2) * 100

  let recommendation = ''
  if (percentChange > 20) {
    recommendation = `⚠️ Significant increase: User underestimated by ~${percentChange.toFixed(0)}%`
  } else if (percentChange < -20) {
    recommendation = `✓ Area lower than estimate. Good news for budget!`
  } else {
    recommendation = '✓ Estimate is accurate'
  }

  return { factor, percentChange, recommendation }
}

/**
 * Get color-coded risk level for a condition
 */
export function getConditionRiskLevel(
  conditionLevel: ConditionLevel
): { level: 'low' | 'medium' | 'high' | 'critical'; color: string; icon: string } {
  switch (conditionLevel) {
    case 'level1':
      return { level: 'low', color: '#22c55e', icon: '✓' }
    case 'level2':
      return { level: 'medium', color: '#eab308', icon: '⚠' }
    case 'level3':
      return { level: 'high', color: '#f97316', icon: '⚠️' }
    case 'level4':
      return { level: 'critical', color: '#dc2626', icon: '🚨' }
  }
}

/**
 * Format condition description for customer communication
 */
export function getCustomerFacingConditionDescription(conditionLevel: ConditionLevel): string {
  const descriptions: Record<ConditionLevel, string> = {
    level1: `Your property is in great condition! We'll clean and apply fresh paint for a beautiful, long-lasting finish.`,
    level2: `Your paintwork shows normal weathering. We'll prepare the surface properly and apply quality paint to restore its appearance.`,
    level3: `Your paint is showing signs of failure with visible peeling and flaking. We'll scrape to sound coating, prime exposed areas, and apply quality paint.`,
    level4: `Your paint has significant failure. We'll strip back to bare substrate using professional methods, prime all surfaces, and apply quality paint. This is more extensive work.`,
  }

  return descriptions[conditionLevel]
}

/**
 * Build a detailed prep work plan based on condition
 */
export function buildPrepWorkPlan(
  conditionLevel: ConditionLevel,
  areaM2: number
): { tasks: string[]; estimatedHours: number } {
  const condition = CONDITION_LEVELS[conditionLevel]
  const estimatedHours = areaM2 * condition.prepHoursPerM2

  const plans: Record<ConditionLevel, string[]> = {
    level1: [
      'Wash down walls with appropriate cleaner',
      'Light sanding of glossy areas',
      'Fill minor gaps with exterior filler',
    ],
    level2: [
      'Pressure wash or hand wash to remove dirt/mold',
      'Sand weathered areas',
      'Fill cracks and gaps',
      'Spot prime any exposed timber',
    ],
    level3: [
      'Scrape off loose/peeling paint',
      'Sand remaining paint to key surface',
      'Fill gaps and cracks',
      'Spot prime all exposed areas',
      'Cover site and protect landscaping',
    ],
    level4: [
      'Heat gun or chemical stripping to remove all paint',
      'Sand entire surface to bare substrate',
      'Repair any structural damage',
      'Full prime before painting',
      'Site protection and cleanup',
    ],
  }

  return {
    tasks: plans[conditionLevel],
    estimatedHours,
  }
}

/**
 * Estimate total project timeline
 */
export function estimateProjectTimeline(
  areaM2: number,
  conditionLevel: ConditionLevel,
  storeys: number = 1,
  weatherForecast?: 'clear' | 'variable' | 'rainy'
): {
  prepDays: number
  paintDays: number
  totalDays: number
  notes: string[]
} {
  const condition = CONDITION_LEVELS[conditionLevel]
  const prepHours = areaM2 * condition.prepHoursPerM2
  const paintHours = areaM2 * 0.15 * 2 // 2 coats at 0.15 hrs/coat/m²

  let prepDays = Math.ceil(prepHours / 8)
  let paintDays = Math.ceil(paintHours / 8)

  // Height penalty
  if (storeys >= 2) {
    paintDays = Math.ceil(paintDays * 1.25)
  }

  const totalDays = prepDays + paintDays + 1 // +1 for contingency

  const notes: string[] = []
  if (conditionLevel === 'level4') {
    notes.push('Full stripping work - may require additional 2-3 days')
  }
  if (storeys >= 2) {
    notes.push('Multi-storey work - scaffolding setup adds setup/teardown time')
  }
  if (weatherForecast === 'rainy' || weatherForecast === 'variable') {
    notes.push('Weather delays possible - recommend June-March for NZ climate')
  }

  return { prepDays, paintDays, totalDays, notes }
}

/**
 * Check if lead paint testing is recommended
 * NZ villas built before 1980s likely have lead paint
 */
export function recommendLeadTesting(
  buildingAge?: number,
  claddingType?: string
): { recommended: boolean; reason: string } {
  if (!buildingAge && !claddingType) {
    return {
      recommended: false,
      reason: 'Insufficient information',
    }
  }

  if (buildingAge && buildingAge > 1980) {
    return {
      recommended: true,
      reason: `Building appears to be pre-1980s (estimated age: ${buildingAge}s) - lead paint likely`,
    }
  }

  if (claddingType?.includes('villa') || claddingType?.includes('heritage')) {
    return {
      recommended: true,
      reason: 'Heritage/villa property - lead paint is common',
    }
  }

  return {
    recommended: false,
    reason: 'Modern construction unlikely to have lead paint',
  }
}

/**
 * Format quote for email/PDF export
 */
export function formatQuoteForExport(quote: any, customerName?: string): string {
  return `
PROFESSIONAL PAINTING QUOTE - HOME PAINTERS NZ
${customerName ? `Customer: ${customerName}` : ''}
Date: ${new Date().toLocaleDateString('en-NZ')}

QUOTE SUMMARY
=============
Total Estimate (inc. GST 15%): $${quote.totalNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
Subtotal: $${quote.subtotalNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}

COST BREAKDOWN
==============
Labor (Prep + Application): $${quote.laborCostNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
  - Prep Hours: ${quote.prepFactor.totalPrepHours.toFixed(1)}
  - Total Labor Hours: ${quote.laborHours.toFixed(1)} hours @ $65/hr

Materials (Paint System): $${quote.materialsCostNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
${quote.accessSurchargeNZD > 0 ? `Access/Scaffolding: $${quote.accessSurchargeNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}` : ''}

ASSUMPTIONS
===========
${quote.assumptions.map((a: string) => `• ${a}`).join('\n')}

NEXT STEPS
==========
1. Review this estimate
2. Contact us to discuss timing and site access
3. Book your painting date
4. Liam personally oversees all projects

Questions? Contact: hello@homepainters.co.nz
Quote Reference: QT-${Date.now()}
`
}
