'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ConditionLevel, QuoteCalculationResponse } from '@/lib/types'
import { calculateQuoteWithImage, calculateQuote } from '@/lib/quote-actions'
import { Upload, Loader2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'

export function QuoteCalculator() {
  const [areaM2, setAreaM2] = useState('')
  const [height, setHeight] = useState('')
  const [condition, setCondition] = useState<ConditionLevel>('level2')
  const [storeys, setStoreys] = useState('1')
  const [paintSystem, setPaintSystem] = useState<'standard' | 'premium' | 'commercial'>('premium')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<QuoteCalculationResponse | null>(null)
  const [error, setError] = useState<string>('')
  
  // Legal & Safety
  const [builtBefore1970, setBuiltBefore1970] = useState(false)
  const [includesLeadRemoval, setIncludesLeadRemoval] = useState(false)
  
  // Coastal
  const [withinCoastal500m, setWithinCoastal500m] = useState(false)
  
  // Additional Works
  const [includesSoffitsFascias, setIncludesSoffitsFascias] = useState(false)
  const [soffisFasciasAreaM2, setSoffisFasciasAreaM2] = useState('')
  const [joineryType, setJoineryType] = useState<'timber' | 'aluminum' | 'mixed' | 'none'>('none')
  const [numTimberFrames, setNumTimberFrames] = useState('')
  
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
      if (!areaM2 && images.length === 0) {
        setError('Please enter area or upload an image for analysis')
        setLoading(false)
        return
      }

      let result: any

      if (imagePreviews.length > 0) {
        const imagesBase64 = imagePreviews
          .map((preview) => preview.split(',')[1])
          .filter(Boolean)

        result = await calculateQuoteWithImage({
          userProvidedAreaM2: areaM2 ? parseFloat(areaM2) : 0,
          userEstimatedHeight: height ? parseFloat(height) : undefined,
          userSelectedCondition: condition,
          storeyCount: parseInt(storeys),
          paintSystem,
          imagesBase64,
          // Legal & Safety
          builtBefore1970,
          includesLeadRemoval: builtBefore1970 && includesLeadRemoval,
          // Coastal
          withinCoastal500m,
          // Additional Works
          includesSoffitsFascias,
          soffisFasciasAreaM2: includesSoffitsFascias ? parseFloat(soffisFasciasAreaM2 || '0') : 0,
          joineryType,
          numTimberFrames: joineryType !== 'none' ? parseInt(numTimberFrames || '0') : 0,
        })
      } else {
        result = await calculateQuote({
          userProvidedAreaM2: parseFloat(areaM2 || '0'),
          userEstimatedHeight: height ? parseFloat(height) : undefined,
          userSelectedCondition: condition,
          storeyCount: parseInt(storeys),
          paintSystem,
          // Legal & Safety
          builtBefore1970,
          includesLeadRemoval: builtBefore1970 && includesLeadRemoval,
          // Coastal
          withinCoastal500m,
          // Additional Works
          includesSoffitsFascias,
          soffisFasciasAreaM2: includesSoffitsFascias ? parseFloat(soffisFasciasAreaM2 || '0') : 0,
          joineryType,
          numTimberFrames: joineryType !== 'none' ? parseInt(numTimberFrames || '0') : 0,
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
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#0f172a' }}>
              Quick Car Valuation Calculator
            </h3>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Get an instant estimate for your car. Based on 2026 Australian market rates.
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Upload Car Photos (Optional - For Better Quote)
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
                  <Upload className="w-8 h-8 mx-auto" style={{ color: '#1e40af' }} />
                  <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    Click to upload car photos
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    JPEG or PNG, max 10MB each, up to 5 images. Include overall view and any damage.
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
              <Label htmlFor="area" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Vehicle Year
              </Label>
              <Input
                id="area"
                type="number"
                placeholder="e.g., 2015"
                value={areaM2}
                onChange={(e) => setAreaM2(e.target.value)}
                min="1990"
                max="2026"
                className="h-11 border-slate-200"
              />
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Manufacturing year
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Engine Size (L) - Optional
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 2.0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                step="0.1"
                className="h-11 border-slate-200"
              />
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                For scrap value calculation
              </p>
            </div>
          </div>

          {/* Condition Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Vehicle Condition
              </Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as ConditionLevel)}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level1">Excellent - Running, minimal damage</SelectItem>
                  <SelectItem value="level2">Good - Running with some wear</SelectItem>
                  <SelectItem value="level3">Fair - Non-running or heavy damage</SelectItem>
                  <SelectItem value="level4">Poor - Wrecked or scrap only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeys" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Body Type
              </Label>
              <Select value={storeys} onValueChange={setStoreys}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sedan/Coupe</SelectItem>
                  <SelectItem value="2">SUV/Wagon</SelectItem>
                  <SelectItem value="3">Truck/Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <Label htmlFor="system" className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Transmission Type
            </Label>
            <Select value={paintSystem} onValueChange={(v) => setPaintSystem(v as any)}>
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Manual</SelectItem>
                <SelectItem value="premium">Automatic</SelectItem>
                <SelectItem value="commercial">CVT/Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CAR DETAILS SECTION */}
          <div className="border-t border-slate-200 pt-6 space-y-6">
            <h4 className="font-semibold text-sm" style={{ color: '#0f172a' }}>
              Additional Vehicle Details
            </h4>

            {/* Registered */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="pre1970"
                  checked={builtBefore1970}
                  onCheckedChange={(checked) => {
                    setBuiltBefore1970(checked as boolean)
                    if (!checked) setIncludesLeadRemoval(false)
                  }}
                />
                <Label htmlFor="pre1970" className="text-sm font-medium cursor-pointer" style={{ color: '#0f172a' }}>
                  Currently Registered?
                </Label>
              </div>
              {builtBefore1970 && (
                <div className="ml-8 flex items-center gap-3">
                  <Checkbox
                    id="leadRemoval"
                    checked={includesLeadRemoval}
                    onCheckedChange={(checked) => setIncludesLeadRemoval(checked as boolean)}
                  />
                  <Label htmlFor="leadRemoval" className="text-sm cursor-pointer flex flex-col gap-1" style={{ color: '#0f172a' }}>
                    <span>Registration in good standing</span>
                    <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                      May affect valuation
                    </span>
                  </Label>
                </div>
              )}
            </div>

            {/* Accidents */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="coastal"
                  checked={withinCoastal500m}
                  onCheckedChange={(checked) => setWithinCoastal500m(checked as boolean)}
                />
                <Label htmlFor="coastal" className="text-sm font-medium cursor-pointer flex flex-col gap-1" style={{ color: '#0f172a' }}>
                  <span>Has Accident History?</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    May result in lower offer
                  </span>
                </Label>
              </div>
            </div>

            {/* Mechanical Issues */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="soffit"
                  checked={includesSoffitsFascias}
                  onCheckedChange={(checked) => {
                    setIncludesSoffitsFascias(checked as boolean)
                    if (!checked) setSoffisFasciasAreaM2('')
                  }}
                />
                <Label htmlFor="soffit" className="text-sm font-medium cursor-pointer" style={{ color: '#0f172a' }}>
                  Known Mechanical Issues?
                </Label>
              </div>
              {includesSoffitsFascias && (
                <div className="ml-8 space-y-2">
                  <Label htmlFor="soffit-area" className="text-sm" style={{ color: '#64748b' }}>
                    Describe Issues
                  </Label>
                  <Input
                    id="soffit-area"
                    type="text"
                    placeholder="e.g., Engine knocking, gearbox slips..."
                    value={soffisFasciasAreaM2}
                    onChange={(e) => setSoffisFasciasAreaM2(e.target.value)}
                    className="h-10 border-slate-200"
                  />
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    We buy cars in any condition - be honest for accurate quote
                  </p>
                </div>
              )}
            </div>

            {/* Mileage */}
            <div className="space-y-3">
              <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Mileage (km)
              </Label>
              <Select value={joineryType} onValueChange={(v) => {
                setJoineryType(v as any)
                if (v === 'none') setNumTimberFrames('')
              }}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Under 100,000 km</SelectItem>
                  <SelectItem value="timber">100,000 - 200,000 km</SelectItem>
                  <SelectItem value="aluminum">200,000+ km</SelectItem>
                  <SelectItem value="mixed">Unknown</SelectItem>
                </SelectContent>
              </Select>
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
            className="w-full h-12 font-semibold text-white bg-[#1e40af] hover:bg-[#1e3a8a] gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Get Car Quote
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
                  Your Car Quote
                </h2>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                  Instant valuation for your vehicle
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            </div>

            {/* Main Price */}
            <div className="bg-white rounded-lg p-6 border border-slate-100">
              <p className="text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                ESTIMATED CASH OFFER
              </p>
              <p className="text-5xl font-bold" style={{ color: '#1e40af' }}>
                ${quote.totalNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>
                Offer based on vehicle details and condition assessment
              </p>
            </div>

            {quote.geminiImageSummaries && quote.geminiImageSummaries.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-slate-100 space-y-3">
                <h3 className="font-semibold" style={{ color: '#0f172a' }}>
                  Photo Analysis
                </h3>
                <ul className="space-y-2">
                  {quote.geminiImageSummaries.map((summary) => (
                    <li key={summary.index} className="text-sm space-y-1" style={{ color: '#475569' }}>
                      <p>
                        <strong>Image {summary.index + 1}:</strong> {summary.description}
                      </p>
                      <p style={{ color: '#64748b' }}>
                        Confidence: {summary.confidence}% | Condition: {summary.conditionLevel} | Area estimate: {summary.estimatedAreaM2.toFixed(1)} m²
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
                  Labor (Prep + Apply)
                </p>
                <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                  ${quote.laborCostNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  {quote.laborHours.toFixed(1)} hours
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                  Materials
                </p>
                <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                  ${quote.materialsCostNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
                </p>
              </div>

              {(quote.accessSurchargeNZD > 0 || quote.leadRemovalCostNZD > 0 || quote.coastalSurchargeCostNZD > 0) && (
                <div className="bg-white rounded-lg p-4 border border-slate-100 md:col-span-2">
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Access/Safety/Compliance Surcharges
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                    ${(quote.accessSurchargeNZD + quote.leadRemovalCostNZD + quote.coastalSurchargeCostNZD).toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}

              {(quote.soffisFasciasCostNZD > 0 || quote.joineryWorkCostNZD > 0) && (
                <div className="bg-white rounded-lg p-4 border border-slate-100 md:col-span-2">
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Additional Works (Trim/Joinery)
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                    ${(quote.soffisFasciasCostNZD + quote.joineryWorkCostNZD).toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </div>

            {/* Crew & Timeline - Highlighted Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <span className="text-lg">⏱️</span> Project Timeline & Crew
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Estimated Duration
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#f97316' }}>
                    {quote.assumptions
                      .find(a => a.includes('Project Duration'))
                      ?.split('~')[1]
                      ?.split(' working')[0] || '4-6 days'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                    Weather dependent
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    Standard Crew
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                    2 Painters
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                    Professional team
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-orange-100">
                <p className="text-xs" style={{ color: '#475569' }}>
                  <strong>Why 2 painters?</strong> One handles ladder work (high areas), the other manages ground-level "cutting in" and prep. Faster completion + safer WorkSafe-compliant access work.
                </p>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-lg p-6 border border-slate-100 space-y-3">
              <h3 className="font-semibold" style={{ color: '#0f172a' }}>
                Job Assumptions
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
              Get Full Professional Quote
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default QuoteCalculator
