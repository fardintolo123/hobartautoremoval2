'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

const EXAMPLE_QUOTES = [
  {
    title: 'Old Sedan / Hatchback',
    vehicle: '2005–2012 Toyota Corolla or Similar',
    condition: 'Not Running — Engine Seized',
    description: 'Common category — scrap value straightforward',
    estimate: '$200–$350',
    midEstimate: '$280',
    pickup: 'FREE',
    timeframe: '24 hours',
    features: ['Free tow truck pickup', 'Cash on the spot', 'Same-day available', 'Title required'],
    highlighted: false,
  },
  {
    title: 'SUV / 4WD',
    vehicle: '2008–2018 Ford Ranger, LC200, Patrol',
    condition: 'Accident Damaged / Write-Off',
    description: 'Larger vehicles with more scrap & parts value',
    estimate: '$350–$700',
    midEstimate: '$500',
    pickup: 'FREE',
    timeframe: '24–48 hours',
    features: ['Free tow truck pickup', 'Top cash paid', 'Insurance write-off accepted', 'No roadworthy needed'],
    highlighted: true,
  },
  {
    title: 'Motorcycle / Scooter',
    vehicle: 'Any make & model',
    condition: 'Any Condition',
    description: 'Bikes, scooters, and ATVs all accepted',
    estimate: '$80–$250',
    midEstimate: '$150',
    pickup: 'FREE',
    timeframe: '1–3 days',
    features: ['Free collection', 'Running or not', 'Old or damaged OK', 'Fast turnaround'],
    highlighted: false,
  },
]

export function QuotePricingExamples() {
  return (
    <section className="py-20" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#f97316' }}>
            Transparent Payouts
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-balance mb-4" style={{ color: '#0f172a' }}>
            Example Cash Payouts
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: '#64748b' }}>
            Real payout ranges based on current scrap metal prices and parts value in Tasmania. Final offer confirmed at pickup.
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
              {quote.highlighted && (
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: '#f97316', color: 'white' }}>
                    Most Common
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1" style={{ color: '#0f172a' }}>
                  {quote.title}
                </h3>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  {quote.vehicle}
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
                  ESTIMATED CASH PAYOUT
                </p>
                <p className="text-3xl font-bold" style={{ color: '#0f172a' }}>
                  {quote.midEstimate}
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                  Range: {quote.estimate} · Pickup: {quote.pickup}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  Timeframe: {quote.timeframe}
                </p>
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
            What's Included with Every Removal
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Free Tow Truck Pickup
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    No towing fees — we come to you anywhere in Greater Hobart
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Cash Paid on the Spot
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Instant payment at pickup — no waiting, no bank delays
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    All Vehicle Types Accepted
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Cars, SUVs, utes, vans, trucks, motorcycles, caravans
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Any Condition Accepted
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Wrecked, rusted, flooded, non-running — we take them all
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Eco-Friendly Recycling
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Responsible fluid disposal and material recycling in Tasmania
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>
                    Paperwork Handled
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    We manage transfer of ownership documentation for you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Note */}
        <div className="mt-8 p-6 rounded-lg border border-amber-200" style={{ backgroundColor: '#fffbeb' }}>
          <p className="text-sm" style={{ color: '#92400e' }}>
            <span className="font-semibold">💡 Note:</span> Payout amounts are estimates based on current scrap metal
            and parts market prices in Tasmania (2026). Final offers are confirmed at time of pickup following vehicle
            inspection. Prices include GST.
          </p>
        </div>
      </div>
    </section>
  )
}

export default QuotePricingExamples
