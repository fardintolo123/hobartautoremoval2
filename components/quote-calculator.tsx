'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { VehicleType, VehicleCondition, QuoteCalculationResponse } from '@/lib/types'
import { calculateQuoteWithImage, calculateQuote } from '@/lib/quote-actions'
import { Upload, Loader2, AlertCircle, CheckCircle2, DollarSign, Truck, MapPin } from 'lucide-react'

export function QuoteCalculator() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleCondition, setVehicleCondition] = useState<VehicleCondition>('good')
  const [locationPostcode, setLocationPostcode] = useState('')
  const [mileage, setMileage] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<QuoteCalculationResponse | null>(null)
  const [error, setError] = useState<string>('')

  // Additional Services
  const [hasHazardousMaterials, setHasHazardousMaterials] = useState(false)
  const [needsFluidDraining, setNeedsFluidDraining] = useState(false)
  const [needsInternalRemoval, setNeedsInternalRemoval] = useState(false)
  const [needsDisassembly, setNeedsDisassembly] = useState(false)
  const [towingDistanceKm, setTowingDistanceKm] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve((event.target?.result as string) || '')
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
      reader.readAsDataURL(file)
    })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    const combined = [...images, ...selectedFiles].slice(0, 5)
    if (images.length + selectedFiles.length > 5) {
      setError('You can upload up to 5 images')
    }

    try {
      const previews = await Promise.all(combined.map(readFileAsDataUrl))
      setImages(combined)
      setImagePreviews(previews)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image previews')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImageAt = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index))
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!vehicleType || !vehicleYear || !locationPostcode) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      let result: any

      if (imagePreviews.length > 0) {
        const imagesBase64 = imagePreviews
          .map((preview) => preview.split(',')[1])
          .filter(Boolean)

        result = await calculateQuoteWithImage({
          vehicleType,
          vehicleYear: parseInt(vehicleYear),
          vehicleCondition,
          locationPostcode,
          mileage: mileage ? parseInt(mileage) : undefined,
          imagesBase64,
          // Additional Services
          hasHazardousMaterials,
          needsFluidDraining,
          needsInternalRemoval,
          needsDisassembly,
          towingDistanceKm: towingDistanceKm ? parseFloat(towingDistanceKm) : 0,
        })
      } else {
        result = await calculateQuote({
          vehicleType,
          vehicleYear: parseInt(vehicleYear),
          vehicleCondition,
          locationPostcode,
          mileage: mileage ? parseInt(mileage) : undefined,
          // Additional Services
          hasHazardousMaterials,
          needsFluidDraining,
          needsInternalRemoval,
          needsDisassembly,
          towingDistanceKm: towingDistanceKm ? parseFloat(towingDistanceKm) : 0,
        })
      }

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
      <Card className="p-8 border border-slate-200">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#0f172a' }}>
              <Truck className="w-5 h-5" />
              Professional Car Removal Quote Calculator
            </h3>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Based on 2026 Tasmania market rates. Environmentally compliant vehicle disposal.
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Upload Vehicle Photos (Optional - For AI Analysis)
            </Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreviews.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((preview, idx) => (
                      <div key={`${images[idx]?.name || 'image'}-${idx}`} className="space-y-2">
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="max-h-28 mx-auto rounded"
                        />
                        <p className="text-xs truncate" style={{ color: '#0f172a' }}>
                          {images[idx]?.name || `Image ${idx + 1}`}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImageAt(idx)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto" style={{ color: '#f97316' }} />
                  <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    Click to upload vehicle photos
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    JPEG or PNG, max 10MB each, up to 5 images. Include exterior, interior, and any damage.
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-type" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Vehicle Type *
              </Label>
              <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="ute">Ute</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="caravan">Caravan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-year" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Vehicle Year *
              </Label>
              <Input
                id="vehicle-year"
                type="number"
                placeholder="e.g., 2015"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                min="1900"
                max="2026"
                className="h-11 border-slate-200"
                required
              />
            </div>
          </div>

          {/* Condition and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Vehicle Condition *
              </Label>
              <Select value={vehicleCondition} onValueChange={(v) => setVehicleCondition(v as VehicleCondition)}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent (Low mileage, minimal wear)</SelectItem>
                  <SelectItem value="good">Good (Moderate wear, running well)</SelectItem>
                  <SelectItem value="fair">Fair (Some wear, needs minor work)</SelectItem>
                  <SelectItem value="poor">Poor (Significant wear/damage)</SelectItem>
                  <SelectItem value="nonrunning">Non-running (Won't start)</SelectItem>
                  <SelectItem value="damaged">Damaged (Major structural damage)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode" className="text-sm font-medium flex items-center gap-1" style={{ color: '#0f172a' }}>
                <MapPin className="w-4 h-4" />
                Postcode *
              </Label>
              <Input
                id="postcode"
                type="text"
                placeholder="e.g., 7000"
                value={locationPostcode}
                onChange={(e) => setLocationPostcode(e.target.value)}
                className="h-11 border-slate-200"
                required
              />
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                For location-based pricing
              </p>
            </div>
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <Label htmlFor="mileage" className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Mileage (Optional)
            </Label>
            <Input
              id="mileage"
              type="number"
              placeholder="e.g., 150000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              step="1000"
              className="h-11 border-slate-200"
            />
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Helps with condition assessment
            </p>
          </div>

          {/* Additional Services */}
          <div className="border-t border-slate-200 pt-6 space-y-6">
            <h4 className="font-semibold text-sm" style={{ color: '#0f172a' }}>
              Additional Services & Requirements
            </h4>

            {/* Hazardous Materials */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="hazardous"
                  checked={hasHazardousMaterials}
                  onCheckedChange={(checked) => setHasHazardousMaterials(checked as boolean)}
                />
                <Label htmlFor="hazardous" className="text-sm font-medium cursor-pointer flex flex-col gap-1" style={{ color: '#0f172a' }}>
                  <span>Hazardous materials present?</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Airbags, mercury switches, batteries, fuel system components (+$150)
                  </span>
                </Label>
              </div>
            </div>

            {/* Fluid Draining */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="fluids"
                  checked={needsFluidDraining}
                  onCheckedChange={(checked) => setNeedsFluidDraining(checked as boolean)}
                />
                <Label htmlFor="fluids" className="text-sm font-medium cursor-pointer flex flex-col gap-1" style={{ color: '#0f172a' }}>
                  <span>Fluid draining required?</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Oil, coolant, brake fluid, transmission fluid (+$75)
                  </span>
                </Label>
              </div>
            </div>

            {/* Internal Removal */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="internal"
                  checked={needsInternalRemoval}
                  onCheckedChange={(checked) => setNeedsInternalRemoval(checked as boolean)}
                />
                <Label htmlFor="internal" className="text-sm font-medium cursor-pointer flex flex-col gap-1" style={{ color: '#0f172a' }}>
                  <span>Internal component removal?</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Seats, dashboard, engine components (+$100)
                  </span>
                </Label>
              </div>
            </div>

            {/* Disassembly */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="disassembly"
                  checked={needsDisassembly}
                  onCheckedChange={(checked) => setNeedsDisassembly(checked as boolean)}
                />
                <Label htmlFor="disassembly" className="text-sm font-medium cursor-pointer flex flex-col gap-1" style={{ color: '#0f172a' }}>
                  <span>Major disassembly required?</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Engine, transmission, axles, body panels (+$200)
                  </span>
                </Label>
              </div>
            </div>

            {/* Towing Distance */}
            <div className="space-y-2">
              <Label htmlFor="towing" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Towing Distance (km) - If vehicle won't start
              </Label>
              <Input
                id="towing"
                type="number"
                placeholder="e.g., 25"
                value={towingDistanceKm}
                onChange={(e) => setTowingDistanceKm(e.target.value)}
                step="1"
                min="0"
                className="h-11 border-slate-200"
              />
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                $3.50/km beyond 25km from depot
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
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
                Calculate Quote
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Quote Results */}
      {quote && (
        <Card className="p-8 border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                  Car Removal Quote
                </h2>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                  Professional Tasmania vehicle disposal estimate
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            </div>

            {/* Main Price */}
            <div className="bg-white rounded-lg p-6 border border-slate-100">
              <p className="text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                TOTAL ESTIMATE (Inc. GST)
              </p>
              <p className="text-5xl font-bold" style={{ color: '#f97316' }}>
                ${quote.totalAUD.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>
                Subtotal (before 10% GST): ${quote.subtotalAUD.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
              </p>
            </div>

            {quote.geminiImageSummaries && quote.geminiImageSummaries.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-slate-100 space-y-3">
                <h3 className="font-semibold" style={{ color: '#0f172a' }}>
                  AI Vehicle Analysis
                </h3>
                <ul className="space-y-2">
                  {quote.geminiImageSummaries.map((summary) => (
                    <li key={summary.index} className="text-sm space-y-1" style={{ color: '#475569' }}>
                      <p>
                        <strong>Image {summary.index + 1}:</strong> {summary.description}
                      </p>
                      <p style={{ color: '#64748b' }}>
                        Confidence: {summary.confidence}% | Condition: {summary.conditionLevel} | Damage: {summary.damageLevel}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                  Base Fee
                </p>
                <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                  ${quote.baseFeeAUD.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  {quote.vehicleType} removal
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                  Condition Adjustment
                </p>
                <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                  ${quote.conditionAdjustmentAUD.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  {quote.conditionMultiplier}x multiplier
                </p>
              </div>

              {(quote.locationSurchargeAUD > 0 || quote.hazardousMaterialsFeeAUD > 0) && (
                <div className="bg-white rounded-lg p-4 border border-slate-100 md:col-span-2">
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Surcharges
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                    ${(quote.locationSurchargeAUD + quote.hazardousMaterialsFeeAUD).toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    Location + hazardous materials
                  </p>
                </div>
              )}

              {(quote.fluidDrainingFeeAUD > 0 || quote.internalRemovalFeeAUD > 0 || quote.disassemblyFeeAUD > 0 || quote.towingFeeAUD > 0) && (
                <div className="bg-white rounded-lg p-4 border border-slate-100 md:col-span-2">
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Additional Services
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                    ${(quote.fluidDrainingFeeAUD + quote.internalRemovalFeeAUD + quote.disassemblyFeeAUD + quote.towingFeeAUD).toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    Fluids, removal, disassembly, towing
                  </p>
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <Truck className="w-5 h-5" />
                Service Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Collection
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#f97316' }}>
                    Same Day
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                    Within Hobart metro area
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Processing
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                    24-48 Hours
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                    Environmentally compliant
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-orange-100">
                <p className="text-xs" style={{ color: '#475569' }}>
                  <strong>What's included:</strong> Collection, environmental disposal, recycling, paperwork. Excludes title transfer fees and any outstanding fines.
                </p>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-lg p-6 border border-slate-100 space-y-3">
              <h3 className="font-semibold" style={{ color: '#0f172a' }}>
                Quote Assumptions
              </h3>
              <ul className="space-y-2">
                {quote.assumptions.map((assumption, idx) => (
                  <li key={idx} className="text-sm flex gap-2" style={{ color: '#475569' }}>
                    <span style={{ color: '#f97316' }}>•</span>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Full Quote CTA */}
            <Button
              className="w-full h-12 font-semibold text-white bg-[#f97316] hover:bg-[#ea6c0a] gap-2"
              onClick={() => {
                // Scroll to lead form or trigger contact
                document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Book Collection
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default QuoteCalculator
