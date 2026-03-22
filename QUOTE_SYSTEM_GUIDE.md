# NZ Home Painters Professional Quote System (2026)

## Overview

This is a sophisticated painting quote system designed specifically for the New Zealand market. It combines:

1. **Professional Man-Hour Algorithm** - How real painters actually quote (not just square meters)
2. **Gemini Vision AI** - Analyzes exterior photos to correct user estimates and detect painting conditions
3. **NZ-Specific Pricing** - WorkSafe compliance, Resene/Dulux materials, current labor rates
4. **Condition Classification** - 4-level system from simple wash to full strip

## System Architecture

### Core Components

#### 1. **Quote Engine** (`lib/quote-engine.ts`)
The brain of the system. Implements the professional algorithm:

```
Total = (Area × Base Rate) + (Prep Factor × Labor) + Access Cost + Materials
```

**Key Features:**
- Prep Multiplier (biggest price driver):
  - Level 1 (Wash & Paint): 0.05 hours/m²
  - Level 2 (Standard Prep): 0.1 hours/m²
  - Level 3 (Heavy Prep): 0.4 hours/m²
  - Level 4 (Full Strip): 0.8 hours/m²

- Height Penalty: +25% to labor if 2+ storey (safety/ladder repositioning)
- Access Surcharge (WorkSafe compliance):
  - Single storey: $0
  - Two storey: $2,000-$5,000 (scaffolding)
  - 3+ storey: $5,000-$10,000 (complex)

- Material Costs (NZ Premium):
  - Standard: $15/m²
  - Premium (Resene/Dulux): $22/m²
  - Commercial: $28/m²

#### 2. **Gemini Vision Analyzer** (`lib/gemini-analyzer.ts`)
Audits user-provided information using Google's Gemini 2.0 Vision API.

**Analysis Capabilities:**
- Detects cladding type (weatherboard, block, brick)
- Scales area using reference objects (NZ door = 1.98m)
- Identifies coating failure % (peeling, cracking)
- Classifies paint condition into 4 levels
- Detects storeys and calculates access difficulty
- Generates specific recommendations

**Example Correction:**
- User says: "10m²"
- Image shows: 2-storey wall with peeling
- System corrects to: "~25m², Heavy Prep (Level 3), 2-storey surcharge required"

#### 3. **Quote Calculator Component** (`components/quote-calculator.tsx`)
User-facing React component with:
- Image upload for AI analysis
- Form inputs (area, height, condition, storeys)
- NZ paint system selection
- Real-time quote calculation
- Detailed cost breakdown
- Assumption transparency

## How to Use

### Setup

1. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

2. **Configure Environment**
Create `.env.local`:
```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

Get API key: https://ai.google.dev

3. **Add Quote Calculator to Page**

In your page or component:
```tsx
import { QuoteCalculator } from '@/components/quote-calculator'

export function MyPage() {
  return (
    <section>
      <QuoteCalculator />
    </section>
  )
}
```

### API Usage

#### Client-Side Calculation (No Image)
```tsx
import { calculateQuote } from '@/lib/quote-actions'

const quote = await calculateQuote({
  userProvidedAreaM2: 45,
  userSelectedCondition: 'level3',
  storeyCount: 2,
  paintSystem: 'premium',
})
```

#### With Image Analysis (Gemini)
```tsx
import { calculateQuoteWithImage } from '@/lib/quote-actions'

const quote = await calculateQuoteWithImage({
  imageBase64: base64EncodedImage,
  userProvidedAreaM2: 45,
  paintSystem: 'premium',
})
```

## Professional Pricing Logic

### The "Man-Hours" Approach

Professional painters think in **hours**, not assumptions:

1. **Prep Hours** = Area × Condition Multiplier
2. **Application Hours** = Area × 0.15/coat × Number of Coats
3. **Height Penalty** = +25% if 2+ storey or >5m
4. **Total Labor** = Prep + Application + Height Penalty
5. **Labor Cost** = Hours × $55-$75/hour (2026 NZ rate)

### Access Surcharge Logic

```
IF height > 2m AND storey >= 2:
  Apply scaffolding surcharge
  Two storey: $2,000-$5,000
  3+ storey: $5,000-$10,000
```

WorkSafe NZ requires professional platforms above 2m height.

### Material System

External painting = **1x Spot Prime + 2x Top Coats**

- Spot Prime: Only on bare areas
- Top Coats: Full coverage
- Cost: $15-$22/m² for NZ premium brands

### Condition Classification

**Level 1: Wash & Paint**
- Smooth, recently painted surface
- < 5% failure
- Prep: 0.05 hours/m²

**Level 2: Standard Prep**
- Minor weathering, light fading
- 5-20% failure
- Requires light sanding
- Prep: 0.1 hours/m²

**Level 3: Heavy Prep** ⚠️
- Visible peeling/flaking (like user's photo)
- 20-50% failure
- Requires scraping + spot priming
- Prep: 0.4 hours/m²
- Typically adds $20-$30/m² to prep cost

**Level 4: Full Strip** 🚨
- Major coating failure
- > 50% failure
- Heat-gun stripping needed
- May expose lead (NZ villas)
- Prep: 0.8 hours/m²
- Can triple total cost

## Gemini Vision Optimization

### Reference Object Scaling

Instead of trusting user estimates:

1. **Find Standard Door** (1.98m high)
2. **Count Elements** (weatherboards: 150mm each)
3. **Calculate Height** (10 boards = 1.5m)
4. **Scale Area** (Length × Height calculated from image)

### Coating Failure Detection

Gemini identifies:
- **Peeling patterns** (circular, edge-based, scattered)
- **Color variations** (indicates failure zones)
- **Surface texture** (rough = failure, smooth = intact)

Provides **% failure** for precise prep cost calculation.

### "Storey" Logic Gate

```
IF image_contains(second_floor):
  storeys = 2
  IF access == "ladder":
    APPLY surcharge(25%)
    APPLY cost_surcharge($3,500)
```

Even if area is same, height = 30-40% slower work.

## Example Quote Scenarios

### Scenario 1: Good Condition, Single Storey
- Area: 30m²
- Condition: Level 2 (Standard Prep)
- Storeys: 1
- Paint: Premium (Resene)

```
Prep: 30m² × 0.1 hrs/m² = 3 hours @ $65 = $195
Paint: 30m² × 0.15 hrs/coat × 2 coats = 9 hours @ $65 = $585
Materials: 30m² × $22 = $660
Access: $0 (single storey)
Subtotal: $1,440
GST (15%): $216
TOTAL: $1,656
```

### Scenario 2: Heavy Peeling (Level 3), Two Storey
- Area: 45m² (corrected by Gemini from user's "30m²")
- Condition: Level 3 (Heavy Prep)
- Storeys: 2
- Paint: Premium

```
Prep: 45m² × 0.4 hrs/m² = 18 hours @ $65 = $1,170
Paint: 45m² × 0.15 hrs/coat × 2 coats = 13.5 hours @ $65 = $877.50
Height Penalty: +25% = +$244
Materials: 45m² × $22 = $990
Access: $3,500 (2-storey scaffolding)
Subtotal: $7,781.50
GST (15%): $1,167
TOTAL: $8,948.50
```

### Scenario 3: Full Strip (Level 4), Villa (Possible Lead)
- Area: 60m²
- Condition: Level 4 (Full Strip)
- Storeys: 2
- Paint: Commercial

```
Prep: 60m² × 0.8 hrs/m² = 48 hours @ $65 = $3,120
Paint: 60m² × 0.15 hrs/coat × 2 coats = 18 hours @ $65 = $1,170
Height Penalty: +25% = +$293
Materials: 60m² × $28 = $1,680
Access: $3,500
Subtotal: $9,763
GST (15%): $1,464
TOTAL: $11,227
NOTE: 48 prep hours is significant - may require +2-3 days work
```

## Integration with Lead Form

After quote calculation, encourage users to:
1. Download/print quote
2. Submit lead form with quote ID
3. Get personal review from Liam (within 2 hours)

## Testing

### Test Quotes Without Image
```bash
# From browser console or API

const { calculateQuote } = await import('/lib/quote-actions.ts')
const result = await calculateQuote({
  userProvidedAreaM2: 45,
  userSelectedCondition: 'level3',
  storeyCount: 2,
  paintSystem: 'premium'
})
console.log(result)
```

### Test Gemini Integration
Requires valid `GOOGLE_GEMINI_API_KEY` in `.env.local`

Upload sample images showing:
- Good condition (should detect Level 1-2)
- Peeling/flaking (should detect Level 3)
- Major failure (should detect Level 4)

## Configuration

### Adjust Labor Rates (Regional)
```typescript
// In quote-actions.ts
const engine = new PainterQuoteEngine(75) // $75/hour for Auckland
```

### Adjust Material Costs
Edit `lib/types.ts` - `NZ_PRICING_2026.MATERIAL_COST_PER_M2`

### Adjust Access Surcharges
Edit `lib/types.ts` - `NZ_PRICING_2026.ACCESS_SURCHARGE`

## NZ Market Specifics (2026)

- **Labor Rates**: $55-$75/hour (varies by region, experience)
- **Paint Brands**: Resene Sonyx 101, Dulux Weathershield
- **WorkSafe Requirements**: Scaffolding mandatory above 2m
- **GST**: 15% included in quotes
- **Lead Paint**: Common in older NZ villas (1920s-1990s) - can triple prep cost
- **Weather Windows**: Oct-April best; June-Aug highest surcharges

## Future Enhancements

1. **Lead Paint Detection** - Gemini can identify high-risk villas
2. **Material Pricing** - Real-time updates from Resene/Dulux
3. **Regional Variations** - Different rates for rural NZ
4. **CRM Integration** - Sync quotes with lead form submissions
5. **Multi-Contractor** - Scale quotes for teams
6. **Maintenance Plans** - 5-year touch-up schedules

---

**System Version**: 1.0 (2026)
**Last Updated**: March 2026
**Maintained**: Liam @ Home Painters NZ
