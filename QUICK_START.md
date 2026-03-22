# 🚀 Quick Start Checklist - Get Quote System Live in 15 Minutes

## Pre-Flight Check

- [ ] You have Node.js 18+ installed
- [ ] You have access to Google Gemini API key
- [ ] You're in the project root directory
- [ ] You can edit `.env.local` file

---

## Step 1: Get Your Gemini API Key (2 min)

```
1. Go to: https://ai.google.dev
2. Click "CREATE PROJECT"
3. Enable Gemini API
4. Go to "API Keys"
5. Create new API key (or copy existing)
6. Copy the 40-character key
```

**Looks like:** `AIzaSy...` (about 40 chars)

---

## Step 2: Setup Environment (1 min)

```bash
# Create .env.local in project root
echo "GOOGLE_GEMINI_API_KEY=AIzaSyYourKeyHere" > .env.local

# Verify it exists
cat .env.local
```

**✓ Should show your key without exposing it on screen**

---

## Step 3: Verify No Build Errors (2 min)

```bash
# Install any missing dependencies
npm install --legacy-peer-deps
# or
pnpm install

# Build to catch any errors
npm run build
```

**✓ Should complete without TypeScript errors**

If errors, check:
- Node version (`node --version` should be 18+)
- All files exist in correct locations
- Env variable is set

---

## Step 4: Add Components to Your Page (3 min)

Edit your `app/page.tsx`:

```tsx
// Add these imports at top
import { QuotePricingExamples } from '@/components/quote-pricing-examples'
import { QuoteCalculator } from '@/components/quote-calculator'

// Inside your page component, add before LeadForm:
export default function HomePage() {
  return (
    <main>
      {/* Your existing sections */}
      <Nav />
      <Hero />
      <SocialProofRibbon />
      
      {/* NEW: Add these two components */}
      <QuotePricingExamples />      {/* Shows example quotes */}
      <QuoteCalculator />            {/* Interactive calculator */}
      
      {/* Your existing sections continue */}
      <LeadForm />
      <FaqSection />
      <Footer />
    </main>
  )
}
```

---

## Step 5: Run Development Server (2 min)

```bash
npm run dev
# or
pnpm dev
```

**✓ Should start on http://localhost:3000**

---

## Step 6: Test It (5 min)

### Test 1: Text-Only Quote
1. Navigate to your homepage
2. Scroll to "Quote Calculator" section
3. Enter:
   - Area: `45`
   - Height: (leave blank)
   - Condition: "Level 3: Heavy Prep"
   - Building Height: "Two Storey"
4. Click "Calculate Quote"
5. **✓ Should see estimate around $8,900**

### Test 2: With Image (Optional)
1. Take a photo of any house exterior
2. Upload it in the form
3. Click "Calculate Quote"
4. **✓ Should analyze image and show results**
5. Check the assumptions - should mention detected condition, height, etc.

### Test 3: API Endpoint
```bash
curl -X GET http://localhost:3000/api/quote
```

**✓ Should return JSON with pricing reference info**

---

## Step 7: Verify Everything Works

- [ ] Components render without crashing
- [ ] Form submission completes (with/without image)
- [ ] Quote displays with valid numbers
- [ ] No console errors (F12 → Console)
- [ ] Mobile responsive (test on phone)
- [ ] API endpoint returns data

---

## ✅ You're Live!

Your quote system is now running locally. The next steps are:

### For Production Deployment

#### Option A: Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
# Follow prompts
# Set GOOGLE_GEMINI_API_KEY in Vercel dashboard
```

#### Option B: Netlify
1. Push repo to GitHub
2. Connect GitHub to Netlify
3. Set env variable in Netlify UI
4. Deploy

#### Option C: Traditional Server
1. Run `npm run build`
2. Run `npm run start`
3. Set `GOOGLE_GEMINI_API_KEY` environment variable
4. Point domain to server

### After Going Live

1. **Monitor API Usage**
   - Check Gemini dashboard monthly
   - Free tier: 60 requests/minute (plenty for most sites)

2. **Test with Real Data**
   - Get actual customer quotes
   - Compare estimates vs. real costs
   - Adjust rates if needed

3. **Update Pricing**
   - Edit `lib/types.ts` for labor rates
   - Update as inflation/costs change
   - Test after each change

4. **Collect Feedback**
   - Are quotes accurate?
   - Is image analysis helpful?
   - Any customer complaints?

---

## 🆘 Troubleshooting

### "API key not found" Error
```
✓ Fix: Check .env.local exists and has correct key
   Run: cat .env.local
   Should show your API key
```

### "Cannot find module" Error
```
✓ Fix: Ensure all files were created
   Run: ls lib/types.ts lib/quote-engine.ts components/quote-calculator.tsx
   All should exist
```

### Image Upload Not Working
```
✓ Fix: Check browser console (F12)
   Make sure image is JPEG/PNG, < 10MB
   Ensure GOOGLE_GEMINI_API_KEY is correct
```

### Quote Numbers Seem Wrong
```
✓ Review: lib/types.ts pricing constants
   Default: $65/hour labor, $22/m² premium paint
   Edit to match your rates
```

### Very Slow Image Analysis
```
✓ Normal: First request might be 2-3 seconds
   Gemini API is external, depends on internet
   Subsequent requests may be cached
```

---

## Quick Reference: What You Added

```
NEW FILES CREATED:
✓ lib/types.ts               - Type definitions
✓ lib/quote-engine.ts        - Pricing algorithm  
✓ lib/gemini-analyzer.ts     - AI vision integration
✓ lib/quote-actions.ts       - Server actions
✓ lib/condition-utils.ts     - Utilities
✓ components/quote-calculator.tsx       - UI component
✓ components/quote-pricing-examples.tsx - Display
✓ app/api/quote/route.ts     - API endpoints
✓ .env.example               - Config template

DOCUMENTATION:
✓ README_QUOTE_SYSTEM.md     - Overview (start here)
✓ QUOTE_SYSTEM_GUIDE.md      - Deep dive
✓ INTEGRATION_GUIDE.md       - How-to guide
✓ SYSTEM_ARCHITECTURE.md     - Technical details
✓ IMPLEMENTATION_EXAMPLES.ts - Code samples
✓ QUICK_START.md             - This file
```

---

## Next Steps After Launch

### Week 1
- [ ] Monitor for errors in production
- [ ] Test quote accuracy
- [ ] Collect user feedback

### Month 1  
- [ ] Review Gemini API usage
- [ ] Check customer conversion rates
- [ ] Adjust labor rates if needed

### Quarter 1
- [ ] Compare estimated vs. actual quotes
- [ ] Update material costs
- [ ] Add any new features

---

## Support Resources

### If Something Breaks
1. Check documentation in repo
2. Review error message (look for keywords)
3. Compare with IMPLEMENTATION_EXAMPLES.ts
4. Test with curl command to isolate issue

### To Customize
1. Open `lib/types.ts` for pricing
2. Open `lib/quote-engine.ts` for algorithm
3. Open `components/quote-calculator.tsx` for UI
4. Test after each change

### To Extend
See INTEGRATION_GUIDE.md section "Future Enhancements"

---

## Final Checklist Before Launch

- [ ] `.env.local` has valid GOOGLE_GEMINI_API_KEY
- [ ] `npm run build` completes with no errors
- [ ] Components added to page.tsx
- [ ] Local test works (text + image quote)
- [ ] API endpoint responds
- [ ] Mobile responsive design works
- [ ] No console errors in browser
- [ ] Domain/SSL configured (if applicable)
- [ ] Error logging set up (optional but recommended)
- [ ] Team knows how to update pricing

---

## 🎉 Success!

Your professional NZ painting quote system is live!

**What customers see:**
- Beautiful quote calculator
- Example estimates for different scenarios
- AI-powered image analysis
- Transparent cost breakdown
- Call-to-action to request full quote

**What happens behind the scenes:**
- Gemini analyzes photos to correct estimates
- Professional man-hour algorithm calculates costs
- 4-level prep classification system
- NZ-specific pricing factors
- WorkSafe compliance surcharges

---

**Questions?** Check the README_QUOTE_SYSTEM.md or INTEGRATION_GUIDE.md

**Ready to customize?** Edit lib/types.ts for your rates and costs

**Version**: 1.0
**Last Updated**: March 2026
**Get Started**: 15 minutes
