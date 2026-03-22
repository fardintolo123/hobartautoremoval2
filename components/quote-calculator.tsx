'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ConditionLevel, QuoteCalculation } from '@/lib/types'
import { calculateQuoteWithImage, calculateQuote } from '@/lib/quote-actions'
import { Upload, Loader2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'

export function QuoteCalculator() {
  const [areaM2, setAreaM2] = useState('')
  const [height, setHeight] = useState('')
  const [condition, setCondition] = useState<ConditionLevel>('level2')
  const [storeys, setStoreys] = useState('1')
  const [paintSystem, setPaintSystem] = useState<'standard' | 'premium' | 'commercial'>('premium')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<QuoteCalculation | null>(null)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!areaM2 && !image) {
        setError('Please enter area or upload an image for analysis')
        setLoading(false)
        return
      }

      let result: any

      if (image && imagePreview) {
        // Extract base64 from data URL
        const base64 = imagePreview.split(',')[1]
        result = await calculateQuoteWithImage({
          userProvidedAreaM2: areaM2 ? parseFloat(areaM2) : 0,
          userEstimatedHeight: height ? parseFloat(height) : undefined,
          userSelectedCondition: condition,
          storeyCount: parseInt(storeys),
          paintSystem,
          imageBase64: base64,
          imageFileName: image?.name,
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
              Professional Paint Quote Calculator
            </h3>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Based on 2026 NZ market rates. Uses professional "Man-Hour" algorithm.
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Upload a photo (optional)
            </Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 mx-auto rounded"
                  />
                  <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    {image?.name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImage(null)
                      setImagePreview('')
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto" style={{ color: '#f97316' }} />
                  <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    Click to upload exterior photo
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    JPEG or PNG, max 10MB. Shows house wall/cladding.
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>

          {/* Area Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Wall Area (m²)
              </Label>
              <Input
                id="area"
                type="number"
                placeholder="e.g., 45.5"
                value={areaM2}
                onChange={(e) => setAreaM2(e.target.value)}
                step="0.1"
                className="h-11 border-slate-200"
              />
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Length × Height (don't subtract windows)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Height (m) - Optional
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 6"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                step="0.1"
                className="h-11 border-slate-200"
              />
            </div>
          </div>

          {/* Condition Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Paint Condition
              </Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as ConditionLevel)}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level1">Level 1: Wash & Paint</SelectItem>
                  <SelectItem value="level2">Level 2: Standard Prep</SelectItem>
                  <SelectItem value="level3">Level 3: Heavy Prep</SelectItem>
                  <SelectItem value="level4">Level 4: Full Strip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeys" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Building Height
              </Label>
              <Select value={storeys} onValueChange={setStoreys}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Single Storey</SelectItem>
                  <SelectItem value="2">Two Storey</SelectItem>
                  <SelectItem value="3">3+ Storey</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paint System */}
          <div className="space-y-2">
            <Label htmlFor="system" className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Paint System (NZ Market)
            </Label>
            <Select value={paintSystem} onValueChange={(v) => setPaintSystem(v as any)}>
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (1x Primer + 2x Coats)</SelectItem>
                <SelectItem value="premium">Premium - Resene/Dulux (1x Primer + 2x Coats)</SelectItem>
                <SelectItem value="commercial">Commercial Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* NZ COMPLIANCE & HIDDEN COSTS SECTION */}
          <div className="border-t border-slate-200 pt-6 space-y-6">
            <h4 className="font-semibold text-sm" style={{ color: '#0f172a' }}>
              Additional Site Details (NZ Compliance & Hidden Costs)
            </h4>

            {/* Lead Paint Testing */}
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
                  Home built before 1970? (Possible lead paint)
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
                    <span>Include lead testing & safe removal</span>
                    <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                      WorkSafe requirement: Testing ($400) + Wet-strip removal ($15-$50/m²)
                    </span>
                  </Label>
                </div>
              )}
            </div>

            {/* Coastal Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="coastal"
                  checked={withinCoastal500m}
                  onCheckedChange={(checked) => setWithinCoastal500m(checked as boolean)}
                />
                <Label htmlFor="coastal" className="text-sm font-medium cursor-pointer flex flex-col gap-1" style={{ color: '#0f172a' }}>
                  <span>Within 500m of coast?</span>
                  <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>
                    Salt wash prep + high-build primer + extra coat
                  </span>
                </Label>
              </div>
            </div>

            {/* Soffits & Fascias */}
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
                  Include Soffits & Fascias?
                </Label>
              </div>
              {includesSoffitsFascias && (
                <div className="ml-8 space-y-2">
                  <Label htmlFor="soffit-area" className="text-sm" style={{ color: '#64748b' }}>
                    Soffits & Fascias Area (m²)
                  </Label>
                  <Input
                    id="soffit-area"
                    type="number"
                    placeholder="e.g., 8"
                    value={soffisFasciasAreaM2}
                    onChange={(e) => setSoffisFasciasAreaM2(e.target.value)}
                    step="0.1"
                    className="h-10 border-slate-200"
                  />
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    Detailed trim work: 0.6 hrs/m² (vs 0.2 hrs/m² for walls)
                  </p>
                </div>
              )}
            </div>

            {/* Joinery Work */}
            <div className="space-y-3">
              <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Window & Door Joinery Type
              </Label>
              <Select value={joineryType} onValueChange={(v) => {
                setJoineryType(v as any)
                if (v === 'none') setNumTimberFrames('')
              }}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Already Included</SelectItem>
                  <SelectItem value="timber">Timber Frames (2.5 hrs each)</SelectItem>
                  <SelectItem value="aluminum">Aluminum (0.3 hrs each)</SelectItem>
                  <SelectItem value="mixed">Mixed Timber & Aluminum</SelectItem>
                </SelectContent>
              </Select>

              {joineryType !== 'none' && (
                <div className="ml-0 space-y-2">
                  <Label htmlFor="frame-count" className="text-sm" style={{ color: '#64748b' }}>
                    Number of Frames (Windows/Doors)
                  </Label>
                  <Input
                    id="frame-count"
                    type="number"
                    placeholder="e.g., 12"
                    value={numTimberFrames}
                    onChange={(e) => setNumTimberFrames(e.target.value)}
                    step="1"
                    className="h-10 border-slate-200"
                  />
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    12 timber frames can add 30+ hours. Aluminum is much faster.
                  </p>
                </div>
              )}
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
                  Estimated Quote
                </h2>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                  Professional NZ painter estimate
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
                ${quote.totalNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>
                Subtotal (before 15% GST): ${quote.subtotalNZD.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
              </p>
            </div>

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
