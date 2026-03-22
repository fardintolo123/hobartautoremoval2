'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

/**
 * Quote Pricing Examples Section
 * Shows typical quotes for different scenarios
 */

const EXAMPLE_QUOTES = [
  {
    title: 'Small Single Storey',
    area: '30m²',
    condition: 'Good condition (Level 2)',
    description: 'Weathered but sound',
    estimate: '$1,656',
    breakdown: {
      labor: '$780',
      materials: '$660',
      access: '$0',
    },
    timeline: '2-3 days',
    features: ['Standard prep', 'Light sanding', 'Premium paint'],
  },
  {
    title: 'Medium Villa - Peeling',
    area: '45m²',
    condition: 'Heavy prep (Level 3)',
    description: 'Visible peeling, needs scraping',
    estimate: '$8,949',
    breakdown: {
      labor: `$2,047`,
      materials: '$990',
      access: '$3,500',
    },
    timeline: '5-6 days',
    features: ['Scraping required', 'Spot priming', 'Scaffolding', '2-storey'],
    highlighted: true,
  },
  {
    title: 'Large Family Home',
    area: '80m²',
    condition: 'Maintenance (Level 2)',
    description: 'Regular upkeep',
    estimate: '$4,782',
    breakdown: {
      labor: '$2,080',
      materials: '$1,760',
      access: '$0',
    },
    timeline: '4-5 days',
    features: ['Single storey', 'Premium coating', 'Full surface coverage'],
  },
]

export function QuotePricingExamples() {
  return (
    <section className="py-20" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#f97316' }}>
            Transparent Pricing
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-balance mb-4" style={{ color: '#0f172a' }}>
            Real Quote Examples
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: '#64748b' }}>
            Based on professional man-hour algorithm. All quotes include GST and cover full surface preparation to bare wood/compound if needed.
          </p>
        </div>

        {/* Quote Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {EXAMPLE_QUOTES.map((quote, idx) => (
            <Card
              key={idx}
              className={`p-8 border transition-all ${
                quote.highlighted
                  ? 'border-[#f97316] bg-gradient-to-br from-orange-50 to-white ring-1 ring-orange-100'
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1" style={{ color: '#0f172a' }}>
                  {quote.title}
                </h3>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  {quote.area}
                </p>
              </div>

              {/* Condition */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f1f5f9' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#f97316' }}>
                  CONDITION
                </p>
                <p className="font-medium" style={{ color: '#0f172a' }}>
                  {quote.condition}
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                  {quote.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6 py-4 border-y border-slate-200">
                <p className="text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>
                  ESTIMATED TOTAL (Inc. GST)
                </p>
                <p className="text-3xl font-bold" style={{ color: '#0f172a' }}>
                  {quote.estimate}
                </p>
                <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                  Timeline: {quote.timeline}
                </p>
              </div>

              {/* Breakdown */}
              <div className="mb-6 space-y-2">
                <p className="text-xs font-semibold mb-3" style={{ color: '#94a3b8' }}>
                  COST BREAKDOWN
                </p>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#64748b' }}>Labor</span>
                  <span style={{ color: '#0f172a' }} className="font-medium">
                    {quote.breakdown.labor}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#64748b' }}>Materials</span>
                  <span style={{ color: '#0f172a' }} className="font-medium">
                    {quote.breakdown.materials}
                  </span>
                </div>
                {quote.breakdown.access !== '$0' && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#64748b' }}>Access/Scaffolding</span>
                    <span style={{ color: '#0f172a' }} className="font-medium">
                      {quote.breakdown.access}
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                {quote.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                    <span className="text-sm" style={{ color: '#475569' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* What's Included */}
        <Card className="p-8 border border-slate-200 bg-white">
          <h3 className="font-semibold text-lg mb-4" style={{ color: '#0f172a' }}>
            What's Included in Every Quote
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Professional Surface Preparation
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Cleaning, sanding, filling, and priming based on condition
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Premium NZ Paint Materials
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Resene or Dulux with UV protection for NZ climate
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Full Coverage Application
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Minimum 2 coats with proper coverage (not just 1x prime + 1x topcoat)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Site Protection
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Covering landscaping, masking windows, floor protection
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    WorkSafe Compliance
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Professional scaffolding and safety precautions where needed
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Liam's Personal Review
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Every estimate reviewed by hand - not just algorithms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <div className="mt-8 p-6 rounded-lg border border-amber-200" style={{ backgroundColor: '#fffbeb' }}>
          <p className="text-sm" style={{ color: '#92400e' }}>
            <span className="font-semibold">💡 Note:</span> These are example estimates based on 2026 NZ labor rates ($55-$75/hr) and
            material costs. Final quotes depend on actual site conditions, weather windows, and scaffolding requirements. Every
            estimate includes full GST and covers the entire exterior wall area.
          </p>
        </div>
      </div>
    </section>
  )
}

export default QuotePricingExamples
