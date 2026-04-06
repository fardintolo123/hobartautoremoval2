'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  VehicleType,
  VehicleCondition,
  LocationZone,
  AutoRemovalQuoteInput,
  AutoRemovalQuoteResult,
  VEHICLE_TYPE_LABELS,
  VEHICLE_CONDITION_LABELS,
  LOCATION_ZONE_LABELS,
} from '@/lib/types'
import { getAutoRemovalQuote } from '@/lib/quote-actions'
import { Car, Loader2, AlertCircle, CheckCircle2, DollarSign, MapPin, Clock, Recycle } from 'lucide-react'

export function QuoteCalculator() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan')
  const [vehicleCondition, setVehicleCondition] = useState<VehicleCondition>('not_running')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [locationZone, setLocationZone] = useState<LocationZone>('hobart_metro')
  const [hasTitle, setHasTitle] = useState(true)
  const [isOnPrivateProperty, setIsOnPrivateProperty] = useState(true)
  const [requiresSameDayPickup, setRequiresSameDayPickup] = useState(false)
  const [hasHazardousFluid, setHasHazardousFluid] = useState(false)

  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<AutoRemovalQuoteResult | null>(null)
  const [error, setError] = useState<string>('')

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const input: AutoRemovalQuoteInput = {
        vehicleType,
        vehicleCondition,
        vehicleYear,
        vehicleMake,
        locationZone,
        hasTitle,
        isOnPrivateProperty,
        requiresSameDayPickup,
        hasHazardousFluid,
      }

      const result = await getAutoRemovalQuote(input)

      if (result.error) {
        setError(result.error)
      } else {
        setQuote(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4">
      {/* Input Form */}
      <Card className="p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Car className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                Instant Car Removal Quote
              </h3>
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Get an instant estimate for your unwanted vehicle. Free towing across Hobart &amp; Tasmania.
            </p>
          </div>

          {/* Vehicle Type + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Vehicle Type
              </Label>
              <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {VEHICLE_TYPE_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleYear" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Year of Manufacture
              </Label>
              <Input
                id="vehicleYear"
                type="number"
                placeholder="e.g., 2010"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                min={1950}
                max={2026}
                className="h-11 border-slate-200"
              />
            </div>
          </div>

          {/* Make + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleMake" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Make / Model <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="vehicleMake"
                type="text"
                placeholder="e.g., Toyota Corolla"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="h-11 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleCondition" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Vehicle Condition
              </Label>
              <Select value={vehicleCondition} onValueChange={(v) => setVehicleCondition(v as VehicleCondition)}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(VEHICLE_CONDITION_LABELS) as VehicleCondition[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {VEHICLE_CONDITION_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="locationZone" className="text-sm font-medium" style={{ color: '#0f172a' }}>
              <MapPin className="inline w-4 h-4 mr-1 mb-0.5" />
              Your Location (Tasmania)
            </Label>
            <Select value={locationZone} onValueChange={(v) => setLocationZone(v as LocationZone)}>
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LOCATION_ZONE_LABELS) as LocationZone[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {LOCATION_ZONE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h4 className="font-semibold text-sm" style={{ color: '#0f172a' }}>
              Additional Details (affects your quote)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasTitle"
                  checked={hasTitle}
                  onCheckedChange={(checked) => setHasTitle(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="hasTitle" className="text-sm cursor-pointer flex flex-col gap-0.5" style={{ color: '#0f172a' }}>
                  <span className="font-medium">I have the title / ownership papers</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Clean title increases your payout by $50+
                  </span>
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="privateProperty"
                  checked={isOnPrivateProperty}
                  onCheckedChange={(checked) => setIsOnPrivateProperty(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="privateProperty" className="text-sm cursor-pointer flex flex-col gap-0.5" style={{ color: '#0f172a' }}>
                  <span className="font-medium">Vehicle is on private property</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Easier access = faster pickup
                  </span>
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="sameDay"
                  checked={requiresSameDayPickup}
                  onCheckedChange={(checked) => setRequiresSameDayPickup(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="sameDay" className="text-sm cursor-pointer flex flex-col gap-0.5" style={{ color: '#0f172a' }}>
                  <span className="font-medium">Need same-day pickup</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Subject to availability — may slightly reduce offer
                  </span>
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="hazardous"
                  checked={hasHazardousFluid}
                  onCheckedChange={(checked) => setHasHazardousFluid(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="hazardous" className="text-sm cursor-pointer flex flex-col gap-0.5" style={{ color: '#0f172a' }}>
                  <span className="font-medium">Leaking fluids / hazmat concern</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Fuel, oil, or coolant leaks (extra handling required)
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 font-semibold text-white bg-[#f97316] hover:bg-[#ea6c0a] gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Get My Instant Quote
              </>
            )}
          </Button>

          <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
            No obligation. Final offer confirmed at pickup after vehicle inspection.
          </p>
        </form>
      </Card>

      {/* Quote Results */}
      {quote && !quote.error && (
        <Card className="p-8 border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                  Your Estimated Payout
                </h2>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                  {vehicleMake || 'Your vehicle'} · {vehicleYear || 'Year unknown'} · {VEHICLE_CONDITION_LABELS[vehicleCondition]}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
            </div>

            {/* Payout Range */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 space-y-3">
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#94a3b8' }}>
                Estimated Cash Payout (incl. GST)
              </p>
              <div className="flex items-end gap-3">
                <p className="text-5xl font-bold" style={{ color: '#f97316' }}>
                  ${quote.estimatedPayout.mid.toLocaleString('en-AU')}
                </p>
                <p className="text-lg pb-1" style={{ color: '#94a3b8' }}>
                  est.
                </p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Low estimate</p>
                  <p className="font-semibold text-sm" style={{ color: '#475569' }}>
                    ${quote.estimatedPayout.low.toLocaleString('en-AU')}
                  </p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>High estimate</p>
                  <p className="font-semibold text-sm" style={{ color: '#475569' }}>
                    ${quote.estimatedPayout.high.toLocaleString('en-AU')}
                  </p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Pickup fee</p>
                  <p className="font-semibold text-sm text-green-600">
                    {quote.pickupFee === 0 ? 'FREE' : `-$${quote.pickupFee}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <Recycle className="w-4 h-4 text-orange-500" />
                What's Included
              </h3>
              <ul className="space-y-2">
                {quote.highlights.map((h, i) => (
                  <li key={i} className="text-sm" style={{ color: '#475569' }}>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeframe */}
            <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-slate-100">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>ESTIMATED PICKUP TIMEFRAME</p>
                <p className="font-semibold" style={{ color: '#0f172a' }}>{quote.timeframe}</p>
              </div>
            </div>

            {/* Assumptions */}
            <div className="bg-white rounded-lg p-5 border border-slate-100 space-y-2">
              <h3 className="font-semibold text-sm" style={{ color: '#0f172a' }}>Quote Assumptions</h3>
              <ul className="space-y-1">
                {quote.assumptions.map((assumption, idx) => (
                  <li key={idx} className="text-sm flex gap-2" style={{ color: '#475569' }}>
                    <span style={{ color: '#f97316' }}>•</span>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Button
              className="w-full h-12 font-semibold text-white bg-[#f97316] hover:bg-[#ea6c0a] gap-2"
              onClick={() => {
                document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Book My Free Pickup Now
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default QuoteCalculator
