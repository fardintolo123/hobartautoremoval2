/**
 * IMPLEMENTATION EXAMPLES
 * Quick reference for integrating the quote system into your application
 */

/**
 * 1. BASIC USAGE: Add Quote Calculator to Your Page
 * ================================================
 */

// In your page.tsx or component:
// import { QuoteCalculator } from '@/components/quote-calculator'

// export default function PricingPage() {
//   return (
//     <main>
//       <section className="py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <h1>Free Painting Quote</h1>
//           <p>Get an accurate estimate based on professional NZ rates</p>
//           <QuoteCalculator />
//         </div>
//       </section>
//     </main>
//   )
// }

/**
 * 2. PROGRAMMATIC QUOTE CALCULATION
 * =================================
 */

// // In a server component or API route:
// import { calculateQuote, calculateQuoteWithImage } from '@/lib/quote-actions'

// // Text-only quote:
// const quote = await calculateQuote({
//   userProvidedAreaM2: 45,
//   userSelectedCondition: 'level3',
//   storeyCount: 2,
//   paintSystem: 'premium',
// })

// console.log(`Total: $${quote.totalNZD}`)
// console.log(`Labor hours: ${quote.laborHours}`)
// console.log(`Prep cost: $${quote.prepFactor.prepCostNZD}`)

/**
 * 3. WITH IMAGE ANALYSIS (Gemini)
 * ===============================
 */

// // Convert image to base64
// function getBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.readAsDataURL(file)
//     reader.onload = () => resolve(reader.result as string)
//     reader.onerror = (error) => reject(error)
//   })
// }

// // Upload image and get corrected quote:
// const imageBase64 = await getBase64(imageFile)
// const quote = await calculateQuoteWithImage({
//   userProvidedAreaM2: 45,
//   imageBase64: imageBase64.split(',')[1], // Remove data URL prefix
//   paintSystem: 'premium',
// })

// // Now quote includes Gemini corrections:
// console.log(`Corrected area: ${quote.areaM2}m²`) // May be different from 45
// console.log(`Detected condition: ${quote.assumptions}`)

/**
 * 4. CUSTOM LABOR RATE
 * ====================
 */

// import PainterQuoteEngine from '@/lib/quote-engine'

// // Create engine with custom rate
// const engineAuckland = new PainterQuoteEngine(75) // $75/hr for Auckland
// const engineRegion = new PainterQuoteEngine(55)    // $55/hr for regions

// const quote1 = engineAuckland.calculate({
//   userProvidedAreaM2: 50,
//   userSelectedCondition: 'level2',
// })

// const quote2 = engineRegion.calculate({
//   userProvidedAreaM2: 50,
//   userSelectedCondition: 'level2',
// })

// console.log(`Auckland estimate: $${quote1.totalNZD}`)
// console.log(`Region estimate: $${quote2.totalNZD}`)

/**
 * 5. CONDITION CLASSIFICATION UTILITIES
 * ====================================
 */

// import {
//   classifyConditionFromVisuals,
//   getPrepTimeEstimate,
//   buildPrepWorkPlan,
//   estimateProjectTimeline,
//   getCustomerFacingConditionDescription,
// } from '@/lib/condition-utils'

// // Auto-classify based on visual parameters
// const condition = classifyConditionFromVisuals(
//   coatingFailurePercentage = 35,
//   hasPeeling = true,
//   hasFlaking = true,
//   hasRust = false,
//   hasMold = false
// )
// console.log(condition) // 'level3'

// // Get prep time estimate
// const { hours, workDays } = getPrepTimeEstimate(45, 'level3')
// console.log(`Prep work: ${hours} hours = ${workDays} days`)

// // Get prep work plan
// const { tasks, estimatedHours } = buildPrepWorkPlan('level3', 45)
// console.log('Prep tasks:')
// tasks.forEach(task => console.log(`  - ${task}`))

// // Full project timeline
// const timeline = estimateProjectTimeline(45, 'level3', 2, 'clear')
// console.log(`Prep: ${timeline.prepDays} days`)
// console.log(`Paint: ${timeline.paintDays} days`)
// console.log(`Total: ${timeline.totalDays} days`)
// timeline.notes.forEach(note => console.log(`  Note: ${note}`))

// // Customer-facing description
// const description = getCustomerFacingConditionDescription('level3')
// console.log(description)

/**
 * 6. WEBHOOK (Make.com) — image + inputs are sent from calculateQuoteWithImage
 * =============================================================================
 * See lib/quote-webhook.ts (postQuoteToWebhook). Optional response JSON can
 * include estimatedAreaM2 + conditionLevel to drive the quote engine.
 */

// // Get surcharge recommendation
// const surcharge = analyzer.recommendAccessSurcharge(analysis)
// console.log(`Access surcharge: $${surcharge}`)

/**
 * 7. API ENDPOINT EXAMPLE
 * =======================
 */

// // app/api/quote/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { calculateQuoteWithImage } from '@/lib/quote-actions'

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { imageBase64, areaM2, condition, storeys } = body

//     const quote = await calculateQuoteWithImage({
//       imageBase64,
//       userProvidedAreaM2: areaM2,
//       userSelectedCondition: condition,
//       storeyCount: storeys,
//     })

//     if (quote.error) {
//       return NextResponse.json({ error: quote.error }, { status: 400 })
//     }

//     return NextResponse.json(quote)
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to process quote' },
//       { status: 500 }
//     )
//   }
// }

/**
 * 8. QUOTE EXPORT/EMAIL
 * ====================
 */

// import { formatQuoteForExport } from '@/lib/condition-utils'

// // Format for email or PDF
// const quoteText = formatQuoteForExport(quote, 'John Smith')
// console.log(quoteText)

// // Save to PDF (using library like pdfkit)
// // or send via email to customer

/**
 * 9. BATCH QUOTE GENERATION
 * ========================
 */

// // Generate quotes for different scenarios to show on landing page

// import PainterQuoteEngine from '@/lib/quote-engine'

// const engine = new PainterQuoteEngine()

// const scenarios = [
//   {
//     name: 'Small villa repair',
//     input: { userProvidedAreaM2: 150, userSelectedCondition: 'level3', storeyCount: 2 },
//   },
//   {
//     name: 'Modern home maintenance',
//     input: { userProvidedAreaM2: 200, userSelectedCondition: 'level2', storeyCount: 1 },
//   },
//   {
//     name: 'Commercial building',
//     input: { userProvidedAreaM2: 500, userSelectedCondition: 'level2', storeyCount: 2, paintSystem: 'commercial' },
//   },
// ]

// scenarios.forEach(scenario => {
//   const quote = engine.calculate(scenario.input)
//   console.log(`${scenario.name}: $${quote.totalNZD.toLocaleString()}`)
// })

/**
 * 10. ERROR HANDLING
 * ==================
 */

// import { calculateQuoteWithImage } from '@/lib/quote-actions'

// try {
//   const quote = await calculateQuoteWithImage({
//     imageBase64: someImage,
//     userProvidedAreaM2: 50,
//   })

//   if (quote.error) {
//     // Image analysis failed - fall back to text-only
//     console.warn('Image analysis failed:', quote.error)
//     // Could show user: "Unable to analyze image, please enter area manually"
//   } else {
//     // Success - show quote
//     console.log(`Quote: $${quote.totalNZD}`)
//   }
// } catch (error) {
//   console.error('Quote calculation error:', error)
//   // Show error to user
// }

export {}
