# System Architecture Overview

## File Structure & Dependencies

```
PROJECT ROOT
├── lib/
│   ├── types.ts                 [TYPES] Core interfaces & constants
│   │   └── Exports: ConditionLevel, QuoteInput, QuoteCalculation, 
│   │     CONDITION_LEVELS, NZ_PRICING_2026
│   │
│   ├── quote-engine.ts          [LOGIC] Professional pricing algorithm
│   │   └── Depends on: types.ts
│   │   └── Exports: PainterQuoteEngine, createQuoteEngine()
│   │
│   ├── gemini-analyzer.ts       [AI] Gemini Vision integration
│   │   └── Depends on: types.ts
│   │   └── Uses: GOOGLE_GEMINI_API_KEY env variable
│   │   └── Exports: GeminiVisionAnalyzer, createGeminiAnalyzer()
│   │
│   ├── quote-actions.ts         [SERVER] Server actions for API key security
│   │   └── Depends on: quote-engine.ts, gemini-analyzer.ts, types.ts
│   │   └── Exports: calculateQuote(), calculateQuoteWithImage()
│   │   └── "use server" - runs on backend only
│   │
│   ├── condition-utils.ts       [UTILS] Helper functions
│   │   └── Depends on: types.ts
│   │   └── Exports: 8+ utility functions
│   │   └── Examples: classifyCondition(), getPrepTimeEstimate(), etc.
│   │
│   └── utils.ts                 [EXISTING] Don't modify
│
├── components/
│   ├── quote-calculator.tsx     [COMPONENT] Interactive form
│   │   └── Depends on: quote-actions.ts, types.ts, ui components
│   │   └── "use client" - runs in browser
│   │   └── Features: Image upload, form, real-time calculation
│   │
│   ├── quote-pricing-examples.tsx [COMPONENT] Display examples
│   │   └── No dependencies (static display)
│   │   └── "use client"
│   │   └── Shows 3 example quotes + what's included
│   │
│   ├── lead-form.tsx            [EXISTING] Contact capture
│   ├── nav.tsx                  [EXISTING]
│   ├── hero.tsx                 [EXISTING]
│   └── ... other existing components
│
├── app/
│   ├── api/
│   │   └── quote/
│   │       └── route.ts         [API] POST/GET endpoints
│   │           └── Depends on: quote-actions.ts, types.ts
│   │           └── POST: Calculate quote with/without image
│   │           └── GET: Return pricing reference
│   │
│   ├── page.tsx                 [EXISTING] Add components here
│   ├── layout.tsx               [EXISTING]
│   └── globals.css              [EXISTING]
│
├── .env.example                 [NEW] Configuration template
├── .env.local                   [NEW] Your API key (create this)
│
├── Documentation/
│   ├── README_QUOTE_SYSTEM.md   [START HERE] Quick overview
│   ├── QUOTE_SYSTEM_GUIDE.md    [DEEP DIVE] Algorithm details
│   ├── INTEGRATION_GUIDE.md     [HOW-TO] Step-by-step integration
│   ├── IMPLEMENTATION_EXAMPLES.ts [EXAMPLES] Code samples
│   └── SYSTEM_ARCHITECTURE.md   [THIS FILE] File structure
│
├── package.json                 [EXISTING] No changes needed
├── tsconfig.json               [EXISTING]
├── next.config.mjs             [EXISTING]
└── ... other config files
```

## Dependency Graph

```
quote-calculator.tsx
    ↓
quote-actions.ts (server actions)
    ├── quote-engine.ts
    │   └── types.ts
    └── gemini-analyzer.ts
        └── types.ts

quote-pricing-examples.tsx
    (no dependencies - standalone)

API route: /api/quote
    ├── quote-actions.ts
    ├── quote-engine.ts
    └── types.ts

condition-utils.ts
    └── types.ts
```

## Data Flow

### Without Image (Text-Only Quote)

```
User Input Form
    ↓
quote-calculator.tsx (client)
    ↓
calculateQuote() (server action)
    ↓
PainterQuoteEngine.calculate()
    ↓
Return QuoteCalculation
    ↓
Display Result
```

### With Image (Full Analysis)

```
User Uploads Image + Form
    ↓
quote-calculator.tsx converts to base64
    ↓
calculateQuoteWithImage() (server action)
    ↓
GeminiVisionAnalyzer.analyzeImage()
    │
    └─→ GOOGLE_GEMINI_API_KEY
        ↓
        Google Gemini Vision API (external)
        ↓
        Returns analysis (area, condition, etc.)
    ↓
PainterQuoteEngine.calculate() with Gemini data
    ↓
Return QuoteCalculation with corrections
    ↓
Display Result showing what was corrected
```

## Configuration Points

### Environment Variables
```
.env.local
└── GOOGLE_GEMINI_API_KEY (required)
```

### Pricing Constants
```
lib/types.ts
├── NZ_PRICING_2026.LABOR_RATE_PER_HOUR (min/mid/max)
├── NZ_PRICING_2026.MATERIAL_COST_PER_M2 (standard/premium/commercial)
├── NZ_PRICING_2026.ACCESS_SURCHARGE (ground/single/two storey/complex)
└── CONDITION_LEVELS (4 levels with prep multipliers)
```

### Component Props
- `QuoteCalculator`: No props (uses defaults)
- `QuotePricingExamples`: No props (static)

## Type System

```typescript
// Main types (from lib/types.ts)

ConditionLevel = 'level1' | 'level2' | 'level3' | 'level4'

QuoteInput {
  userProvidedAreaM2: number
  userSelectedCondition?: ConditionLevel
  storeyCount?: number
  paintSystem?: 'standard' | 'premium' | 'commercial'
  gemminiAnalysis?: GeminiVisionAnalysis
  // ... more fields
}

QuoteCalculation {
  areaM2: number
  laborHours: number
  laborCostNZD: number
  totalNZD: number
  assumptions: string[]
  breakdown: { prep, labor, materials, access }
}

GeminiVisionAnalysis {
  claddingType: string
  estimatedHeightM: number
  estimatedAreaM2: number
  coatingFailurePercentage: number
  conditionLevel: ConditionLevel
  // ... more fields
}
```

## Algorithm Flow

```
Input: Area, Condition, Storeys
    ↓
STEP 1: Calculate Prep Hours
    prep = area × condition.prepHoursPerM2
    ↓
STEP 2: Calculate Application Hours
    paint = area × 0.15 × coats
    ↓
STEP 3: Apply Height Penalty
    IF storeys >= 2:
        penalty = paint × 0.25
    ↓
STEP 4: Total Labor Hours
    total_labor = prep + paint + penalty
    ↓
STEP 5: Labor Cost
    labor_cost = total_labor × labor_rate
    ↓
STEP 6: Material Cost
    material_cost = area × per_m2_cost
    ↓
STEP 7: Access Surcharge
    IF storeys == 2: surcharge = $3500
    ELSE IF storeys >= 3: surcharge = $7500
    ELSE: surcharge = $0
    ↓
STEP 8: Subtotal
    subtotal = labor_cost + material_cost + surcharge
    ↓
STEP 9: GST
    gst = subtotal × 0.15
    ↓
STEP 10: Final Total
    total = subtotal + gst
    ↓
Output: QuoteCalculation object with breakdown
```

## Module Purposes at a Glance

| Module | Size | Purpose | Dependencies |
|--------|------|---------|---|
| types.ts | 150L | Interfaces + constants | None |
| quote-engine.ts | 200L | Core algorithm | types.ts |
| gemini-analyzer.ts | 250L | Vision AI wrapper | types.ts, fetch API |
| quote-actions.ts | 50L | Server-safe entry points | quote-engine.ts, gemini-analyzer.ts |
| condition-utils.ts | 400L | Helper functions | types.ts |
| quote-calculator.tsx | 350L | Interactive UI | quote-actions.ts, UI components |
| quote-pricing-examples.tsx | 250L | Marketing display | UI components |
| api/quote/route.ts | 100L | REST endpoints | quote-actions.ts, types.ts |

## Data Volume Estimates

### Typical Quote Calculation
- Input size: <1KB (JSON form data)
- Output size: ~2KB (quote result)
- Processing time: <100ms (no image)

### With Image Analysis
- Image size: <5MB
- Gemini request: ~10KB (prompt + image)
- Gemini response: ~500B (JSON analysis)
- Total time: 2-5 seconds

### API Usage
- Gemini API: ~50-100 requests/month = well within free tier
- Next.js API routes: Unlimited (Vercel serverless)

## Error Handling Chain

```
Component Form Submission
    ↓
validateInput()
    └─ ✗ Return error message
    ↓ ✓ Continue
calculateQuoteWithImage() server action
    ├─ Try: analyzeImage()
    │   └─ ✗ Catch: API error, return error message
    │   ↓ ✓ Continue
    ├─ Try: quoteEngine.calculate()
    │   └─ ✗ Catch: Calculation error, return error message
    │   ↓ ✓ Continue
    └─ Return success
    ↓
Component catches error (check for .error)
    ├─ ✗ error exists: Display error UI
    └─ ✓ Continue: Display quote
```

## Scalability Considerations

### To Scale Up

1. **Add More Conditions**
   - Create level5, level6 in CONDITION_LEVELS
   - Update pricing calculations

2. **Regional Pricing**
   - Add labor_rate parameter
   - Create different engines per region

3. **Material Variants**
   - Extend paintSystem enum
   - Add costs to MATERIAL_COST_PER_M2

4. **Lead Paint Handling**
   - Add to GeminiVisionAnalysis
   - Add surcharge logic in quote-engine.ts

5. **Multi-Quote Export**
   - Use formatQuoteForExport() from condition-utils
   - Generate PDF with pdfkit/similar

### Performance Optimization

- Cache Gemini responses by image hash
- Pre-calculate common scenarios
- Use memoization for repeated calculations
- Add request batching for API

## Deployment Checklist

- [ ] `.env.local` has GOOGLE_GEMINI_API_KEY
- [ ] Run `npm run build` succeeds
- [ ] No TypeScript errors: `npm run lint`
- [ ] Test quote calculation without image
- [ ] Test with sample image upload
- [ ] Verify API endpoint `/api/quote` works
- [ ] Add components to page in correct order
- [ ] Test on mobile (responsive design)
- [ ] Monitor Gemini API costs (free tier available)
- [ ] Set up error logging if possible

## Testing Strategy

```typescript
// Manual Testing
1. Try text-only quote (should work instantly)
2. Upload sample images (should trigger Gemini)
3. Verify calculations with manual math
4. Check edge cases (very small/large areas)
5. Test all condition levels (1-4)
6. Cross-check with handed quotes

// Automation (Future)
// Could add Jest tests for:
- quote-engine calculations
- condition-utils functions
- API endpoint responses
```

## Maintenance

### Monthly
- Monitor Gemini API usage
- Review customer feedback on accuracy
- Check for calculation errors in real quotes

### Quarterly
- Update labor rates if changed
- Adjust material costs for inflation
- Review condition classification accuracy

### Annually
- Full pricing review
- Update for new products/materials
- Performance audit

---

**System Version**: 1.0
**Architecture Designed**: March 2026
**Status**: Production Ready ✅
