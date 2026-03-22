# Professional NZ Painting Quote System - Integration Guide

## Quick Start

### 1. Setup Environment
```bash
# Create .env.local
echo "GOOGLE_GEMINI_API_KEY=your_key_here" > .env.local
```

Get API key: https://ai.google.dev

### 2. Add Components to Your Page

In your main page.tsx:

```tsx
import { QuotePricingExamples } from '@/components/quote-pricing-examples'
import { QuoteCalculator } from '@/components/quote-calculator'
import { LeadForm } from '@/components/lead-form'

export default function HomePage() {
  return (
    <main>
      {/* Your other sections */}
      
      <QuotePricingExamples />        {/* Show example quotes */}
      <QuoteCalculator />               {/* Interactive calculator */}
      <LeadForm />                     {/* Collect details */}
    </main>
  )
}
```

### 3. Test It

```bash
npm run dev
# Navigate to http://localhost:3000
# Try the calculator with/without images
```

---

## System Components

### Core Modules

| File | Purpose |
|------|---------|
| `lib/types.ts` | All TypeScript interfaces and constants |
| `lib/quote-engine.ts` | Professional pricing algorithm |
| `lib/gemini-analyzer.ts` | Gemini Vision API integration |
| `lib/quote-actions.ts` | Server actions for safe API key usage |
| `lib/condition-utils.ts` | Utilities for condition classification |

### React Components

| Component | Purpose |
|-----------|---------|
| `components/quote-calculator.tsx` | Full interactive quote form with image upload |
| `components/quote-pricing-examples.tsx` | Display example quotes and pricing |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/quote` | POST | Calculate quote with image analysis |
| `/api/quote` | GET | Get pricing reference data |

---

## The Professional Algorithm

### Formula
```
Total = (Area × Base Rate) + (Prep Factor × Labor) + Access Cost + Materials
```

### Step-by-Step Breakdown

1. **Calculate Prep Hours**
   ```
   Prep Hours = Area (m²) × Prep Hours Per m² (by condition level)
   ```
   - Level 1: 0.05 hrs/m² (wash & paint)
   - Level 2: 0.1 hrs/m² (standard prep)
   - Level 3: 0.4 hrs/m² (heavy prep - peeling)
   - Level 4: 0.8 hrs/m² (full strip)

2. **Calculate Application Labor**
   ```
   Application Hours = Area × 0.15 hrs/coat × Number of Coats
   ```
   Default: 2 coats = 30% of area per hour

3. **Apply Height Penalty**
   ```
   IF Storeys >= 2 OR Height > 5m:
     Add 25% to application labor
   ```

4. **Convert to Dollar Cost**
   ```
   Total Labor $ = (Prep Hours + Application Hours + Height Penalty) × Labor Rate
   ```
   NZ 2026: $55-$75/hour

5. **Add Materials**
   ```
   Materials = Area × Cost Per m²
   ```
   - Standard: $15/m²
   - Premium (Resene/Dulux): $22/m²
   - Commercial: $28/m²

6. **Add Access Surcharge**
   ```
   IF Storeys == 1: $0
   IF Storeys == 2: $2,000-$5,000 (scaffolding)
   IF Storeys >= 3: $5,000-$10,000 (complex)
   ```

7. **Apply GST**
   ```
   Final = Subtotal × 1.15
   ```

### Example: Heavy Prep (Level 3), 2-Storey Villa, 45m²

```
Prep Hours:           45m² × 0.4 hrs/m² = 18 hours
Application Hours:    45m² × 0.15 hrs/coat × 2 coats = 13.5 hours
Height Penalty (25%): 13.5 × 0.25 = 3.375 hours
Total Labor Hours:    18 + 13.5 + 3.375 = 34.875 hours

Labor Cost:           34.875 hours × $65/hr = $2,267
Materials:            45m² × $22/m² = $990
Access Surcharge:     $3,500 (2-storey)
_______________________________________________
Subtotal:             $6,757
GST (15%):            $1,013
TOTAL:                $7,770
```

---

## Gemini Vision Integration

### How It Works

1. **User uploads image** → Component converts to base64
2. **Sent to backend** → Server action calls Gemini API
3. **Gemini analyzes** → Detects:
   - Cladding type (weatherboard, block, brick)
   - Height using reference objects (NZ door = 1.98m)
   - Condition level (peeling %, flaking, etc.)
   - Number of storeys
   - Access difficulty
4. **Returns corrected data** → Used in quote calculation

### Custom Prompt Sent to Gemini

The system instructs Gemini to:
- Identify building elements (weatherboards, doors, windows)
- Use standard NZ references for scaling (1.98m door)
- Classify coating failure into 4 specific levels
- Provide confidence score
- Return JSON for reliable parsing

### Example Correction

**User Input:**
- "I think it's about 10m²"
- Uploads photo of 2-storey wall with peeling paint

**Gemini Analysis:**
- Detects: 25 weatherboards × 150mm = 3.75m height
- Measures width: ~6m (using door as reference)
- Calculates: 3.75m × 6m = 22.5m² ≈ 25m²
- Detects: Visible peeling = 35% coating failure → Level 3
- Identifies: Second storey visible → 2 storeys

**Correction Applied:**
- Area: 10m² → 25m² (+150% increase)
- Condition: Unknown → Level 3 (Heavy Prep)
- Cost Impact: +$10,000 due to area + access surcharge

---

## Condition Classification

### Level 1: Wash & Paint
- **Visual**: Smooth surface, no fading
- **Failure %**: <5%
- **Prep**: 0.05 hrs/m²
- **Customer message**: "Your property is in great condition!"

### Level 2: Standard Prep
- **Visual**: Minor fading, light weathering
- **Failure %**: 5-20%
- **Prep**: 0.1 hrs/m²
- **Tasks**: Light sanding, fill minor gaps, spot prime
- **Customer message**: "Normal weathering - we'll restore it beautifully"

### Level 3: Heavy Prep ⚠️
- **Visual**: Visible peeling, flaking, cracking
- **Failure %**: 20-50%
- **Prep**: 0.4 hrs/m²
- **Tasks**: Scrape loose paint, sand, fill, spot prime
- **Typical prep cost**: +$20-30/m²
- **Customer message**: "Peeling detected - requires professional scraping"

### Level 4: Full Strip 🚨
- **Visual**: Major failure, rust, mold
- **Failure %**: >50%
- **Prep**: 0.8 hrs/m²
- **Tasks**: Heat gun stripping, repair, full prime
- **Typical prep cost**: +$50-60/m²
- **Customer message**: "Significant work needed - may require special process"

---

## API Usage

### Calculate Quote (No Image)

```bash
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "userProvidedAreaM2": 45,
    "userSelectedCondition": "level3",
    "storeyCount": 2,
    "paintSystem": "premium"
  }'
```

**Response:**
```json
{
  "areaM2": 45,
  "laborHours": 34.875,
  "laborCostNZD": 2267,
  "materialsCostNZD": 990,
  "accessSurchargeNZD": 3500,
  "subtotalNZD": 6757,
  "gstNZD": 1013,
  "totalNZD": 7770,
  "assumptions": [
    "Area: 45.0 m²",
    "Condition: Heavy Prep - Visible peeling, needs scraping/spot priming",
    "Paint System: premium (2 coats)",
    "Labour hours: 34.9 hours @ $65/hr",
    "Height: 2-storey (includes scaffolding surcharge)"
  ]
}
```

### Calculate Quote (With Image)

```bash
# First convert image to base64, then:
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "iVBORw0KGgoFromYourBase64Image...",
    "userProvidedAreaM2": 45,
    "paintSystem": "premium"
  }'
```

**Response includes Gemini analysis:**
```json
{
  "areaM2": 25,  // Corrected from user estimate
  "assumptions": [
    "Area corrected by image analysis",
    "Cladding: Bevel-back weatherboard",
    "Condition: Level 3 (Heavy Prep) - 35% coating failure detected",
    "Storeys: 2 (second floor detected)",
    "Height: 3.75m",
    "Access: Requires scaffolding"
  ]
}
```

### Get Pricing Reference

```bash
curl http://localhost:3000/api/quote
```

Returns all pricing constants for the NZ 2026 market.

---

## Customization

### Change Labor Rates (Regional)

```typescript
// For different regions in quote-engine.ts
const engine = new PainterQuoteEngine(55)  // Rural NZ
const engine = new PainterQuoteEngine(65)  // Mid range
const engine = new PainterQuoteEngine(75)  // Auckland/Urban
```

### Adjust Material Costs

Edit `lib/types.ts`:
```typescript
MATERIAL_COST_PER_M2: {
  standard: 15,
  premium: 24,  // Updated Resene pricing
  commercial: 30
}
```

### Modify Condition Levels

Edit `lib/types.ts`:
```typescript
level3: {
  level: 'level3',
  description: 'Heavy Prep - Visible peeling',
  prepHoursPerM2: 0.5,  // Changed from 0.4
  examples: [...]
}
```

### Adjust Access Surcharges

Edit `lib/types.ts`:
```typescript
ACCESS_SURCHARGE: {
  twoStoreyScaffolding: { min: 2500, mid: 4000, max: 5500 }
}
```

---

## Real-World Scenarios

### Scenario 1: Good Condition Single Storey (25m²)

**Input:**
- Area: 25m²
- Condition: Level 2 (good condition)
- Storeys: 1
- Paint: Premium

**Calculation:**
```
Prep:    25 × 0.1 = 2.5 hrs × $65 = $162.50
Paint:   25 × 0.15 × 2 = 7.5 hrs × $65 = $487.50
Labor:   $650
Materials: 25 × $22 = $550
Access:  $0
Subtotal: $1,200
GST:     $180
TOTAL:   $1,380
```

### Scenario 2: Complex 2-Storey with Lead Paint Risk

**Input:**
- Area: 60m² (corrected by Gemini from user's 40m²)
- Condition: Level 4 (full strip)
- Height: 6.5m (2-storey)
- Lead paint stripping needed
- Paint: Commercial

**Calculation:**
```
Prep:    60 × 0.8 = 48 hrs (includes lead protocols)
Paint:   60 × 0.15 × 2 = 18 hrs
Penalty: 18 × 0.25 = 4.5 hrs (height)
Labor:   70.5 hrs × $65 = $4,582.50
Materials: 60 × $28 = $1,680
Access:  $5,000 (complex scaffolding)
Subtotal: $11,262.50
GST:     $1,689.38
TOTAL:   $12,951.88

Timeline: 9-11 days
Lead testing/removal may add $1-3k
```

### Scenario 3: Rural Property - Standard Quote

**Input:**
- Area: 35m²
- Condition: Level 2
- Labor rate: $55/hr (rural)
- Storeys: 1

**Calculation:**
```
Prep:    35 × 0.1 = 3.5 hrs × $55 = $192.50
Paint:   35 × 0.15 × 2 = 10.5 hrs × $55 = $577.50
Labor:   $770
Materials: 35 × $22 = $770
Access:  $0
Subtotal: $1,540
GST:     $231
TOTAL:   $1,771
```

---

## Troubleshooting

### Image Analysis Fails
- Check API key in `.env.local`
- Verify image shows exterior house wall
- Image should be <10MB, JPEG/PNG
- Try simpler/clearer image

### Quote Too High
- Check condition level selected
- Verify storey count
- Review build assumptions
- Compare against examples

### Quote API Returns Error
- Ensure area > 0 or image provided
- Check `userProvidedAreaM2` format
- Verify TypeScript types match

### Gemini Low Confidence
- Image unclear or not a house
- Try different photo angle
- Manual entry may be better fallback

---

## Performance & Security

### API Key Security
- Never exposed to client
- Only used in server actions
- Rate limiting not implemented (consider adding)

### Response Caching
- Quote calculations not cached (dynamic based on image)
- Pricing reference data could be cached
- Gemini API has rate limits (monitor usage)

### Image Storage
- Images not stored on server
- Processed and discarded immediately
- No Gemini image storage by default

---

## Future Enhancements

1. **Lead Paint Detection** - Scan for high-risk older properties
2. **Weather Window Analysis** - Show best/worst months for painting
3. **Material Pricing API** - Real-time Resene/Dulux pricing
4. **Multi-Quote Export** - PDF generation for comparison
5. **CRM Integration** - Sync quotes → lead database
6. **Contractor Scaling** - Adjust rates for team size
7. **Maintenance Plans** - 5-year touch-up packages

---

## Support & Maintenance

### Monitor
- Check Gemini API usage monthly
- Review quote accuracy against actual jobs
- Update material costs seasonally

### Update
- Annual labor rate review
- Adjust for inflation
- Add regional pricing variants

### Test
- Use example images to validate
- Compare calculated vs manual quotes
- Test all condition levels

---

## Pricing Reference (2026 NZ)

| Item | Cost |
|------|------|
| Labor/Hour | $55-$75 |
| Premium Paint/m² | $22 |
| Standard Paint/m² | $15 |
| 2-Storey Scaffolding | $3,500 avg |
| Lead Testing | $500-1,000 |
| GST Rate | 15% |

**Last Updated:** March 2026
**System Version:** 1.0
