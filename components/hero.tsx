"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Upload, Sparkles, CheckCircle2, Star, X, AlertCircle, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface LineItem {
  label: string
  low: number
  high: number
}

interface Estimate {
  lineItems: LineItem[]
  totalLow: number
  totalHigh: number
  notes: string
  confidence: "high" | "medium" | "low"
}

function fmt(n: number) {
  return `$${n.toLocaleString("en-NZ")}`
}

function EstimateResult({ estimate }: { estimate: Estimate }) {
  return (
    <div className="space-y-3 py-2 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4" style={{ color: "#f97316" }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#f97316" }}>
          AI Estimate Generated
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: estimate.confidence === "high" ? "#f0fdf4" : estimate.confidence === "medium" ? "#fff7ed" : "#fef2f2",
            color: estimate.confidence === "high" ? "#16a34a" : estimate.confidence === "medium" ? "#f97316" : "#dc2626",
          }}
        >
          {estimate.confidence === "high" ? "High confidence" : estimate.confidence === "medium" ? "Medium confidence" : "Low confidence"}
        </span>
      </div>

      {estimate.lineItems.map((item) => (
        <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-sm" style={{ color: "#64748b" }}>{item.label}</span>
          <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
            {fmt(item.low)} – {fmt(item.high)}
          </span>
        </div>
      ))}

      <div className="flex items-center justify-between pt-2">
        <span className="font-bold" style={{ color: "#0f172a" }}>Estimated Total</span>
        <span className="text-xl font-bold" style={{ color: "#f97316" }}>
          {fmt(estimate.totalLow)} – {fmt(estimate.totalHigh)}
        </span>
      </div>

      {estimate.notes && (
        <p className="text-xs mt-1 leading-relaxed" style={{ color: "#64748b" }}>
          {estimate.notes}
        </p>
      )}

      <p className="text-xs" style={{ color: "#94a3b8" }}>
        Prices ex-GST · Based on NZ market rates · Liam verifies every quote
      </p>
    </div>
  )
}

function LoadingShimmer() {
  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 animate-pulse" style={{ color: "#f97316" }} />
        <span className="text-xs font-semibold uppercase tracking-widest animate-pulse" style={{ color: "#f97316" }}>
          Gemini AI is analysing your space…
        </span>
      </div>
      {[80, 60, 70].map((w, i) => (
        <div
          key={i}
          className="h-8 rounded-lg animate-pulse"
          style={{
            background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
            backgroundSize: "200% 100%",
            width: `${w}%`,
          }}
        />
      ))}
    </div>
  )
}

export function Hero() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [error, setError] = useState<string | null>(null)

  // User info fields
  const [roomType, setRoomType] = useState("")
  const [size, setSize] = useState("")
  const [condition, setCondition] = useState("")
  const [suburb, setSuburb] = useState("")
  const [notes, setNotes] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)

  const addFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"))
    if (!imageFiles.length) return
    setFiles((prev) => [...prev, ...imageFiles])
    imageFiles.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string])
      reader.readAsDataURL(f)
    })
    setEstimate(null)
    setError(null)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setEstimate(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setEstimate(null)

    const formData = new FormData()
    formData.append("roomType", roomType)
    formData.append("size", size)
    formData.append("condition", condition)
    formData.append("suburb", suburb)
    formData.append("notes", notes)
    files.forEach((f) => formData.append("images", f))

    try {
      const res = await fetch("/api/estimate", { method: "POST", body: formData })
      const data = await res.json()
      if (data.success) {
        setEstimate(data.estimate)
      } else {
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const hasInfo = roomType || size || suburb || files.length > 0

  return (
    <section
      className="relative min-h-screen flex items-center pt-16"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — copy */}
          <div className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#f97316" }} />
              <span className="text-xs font-medium text-white/70">
                Liam 'The Detail' Walsh — Auckland's most precise painter
              </span>
            </div>

            <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl leading-tight text-balance text-white mb-6">
              Get a precise painting estimate in{" "}
              <span style={{ color: "#f97316" }}>60 seconds.</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: "#94a3b8" }}>
              Upload photos of your room or exterior and tell us about the job. Our AI — powered by Google Gemini — analyses your space and generates a fixed-price estimate backed by real Auckland project data.
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              {[
                "Fixed-price quotes",
                "5-year no-peel warranty",
                "HEPA clean-site protocol",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-white/60">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#f97316" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — AI Estimator card */}
          <div>
            <Card className="border-0 shadow-2xl overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: "#0f172a" }}>
                      Magic AI Estimator
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      Powered by Google Gemini Vision
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#fff7ed" }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: "#f97316" }} />
                  </div>
                </div>

                {/* Image upload zone */}
                {!loading && !estimate && (
                  <div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "w-full rounded-xl border-2 border-dashed transition-all duration-200 p-6 flex flex-col items-center gap-3 cursor-pointer",
                        isDragging
                          ? "border-orange-400 bg-orange-50"
                          : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/40"
                      )}
                      aria-label="Upload photos of your room"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#fff7ed" }}
                      >
                        <ImagePlus className="w-5 h-5" style={{ color: "#f97316" }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
                          Drop photos here
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                          or click to browse · multiple images supported · JPG, PNG, HEIC
                        </p>
                      </div>
                    </button>

                    {/* Image previews */}
                    {previews.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {previews.map((src, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              aria-label={`Remove photo ${i + 1}`}
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 hover:border-orange-300 flex items-center justify-center transition-colors"
                          aria-label="Add more photos"
                        >
                          <Upload className="w-4 h-4" style={{ color: "#94a3b8" }} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleChange}
                  aria-label="File input"
                />

                {/* User info fields — shown when not loading/estimated */}
                {!loading && !estimate && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="roomType" className="text-xs font-medium" style={{ color: "#0f172a" }}>
                          Room / area type
                        </Label>
                        <Input
                          id="roomType"
                          placeholder="e.g. Living room"
                          value={roomType}
                          onChange={(e) => setRoomType(e.target.value)}
                          className="h-9 text-sm border-slate-200 focus-visible:ring-orange-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="size" className="text-xs font-medium" style={{ color: "#0f172a" }}>
                          Approx. size
                        </Label>
                        <Input
                          id="size"
                          placeholder="e.g. 30m²"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          className="h-9 text-sm border-slate-200 focus-visible:ring-orange-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="suburb" className="text-xs font-medium" style={{ color: "#0f172a" }}>
                          Suburb / location
                        </Label>
                        <Input
                          id="suburb"
                          placeholder="e.g. Ponsonby"
                          value={suburb}
                          onChange={(e) => setSuburb(e.target.value)}
                          className="h-9 text-sm border-slate-200 focus-visible:ring-orange-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="condition" className="text-xs font-medium" style={{ color: "#0f172a" }}>
                          Surface condition
                        </Label>
                        <Input
                          id="condition"
                          placeholder="e.g. Peeling, bare"
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="h-9 text-sm border-slate-200 focus-visible:ring-orange-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="notes" className="text-xs font-medium" style={{ color: "#0f172a" }}>
                        Additional notes <span style={{ color: "#94a3b8" }}>(optional)</span>
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="e.g. High ceilings, feature wall, exterior weatherboards…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="text-sm border-slate-200 focus-visible:ring-orange-300 resize-none"
                      />
                    </div>
                  </div>
                )}

                {loading && <LoadingShimmer />}
                {estimate && <EstimateResult estimate={estimate} />}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {estimate ? (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-11 font-semibold text-white shadow-none border-0 cursor-pointer bg-[#f97316] hover:bg-[#ea6c0a]"
                      onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Lock In This Estimate
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 px-4 border-slate-200 cursor-pointer"
                      onClick={() => { setEstimate(null); setFiles([]); setPreviews([]) }}
                    >
                      Reset
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full h-11 font-semibold text-white shadow-none border-0 cursor-pointer bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-50"
                    onClick={handleGenerate}
                    disabled={loading || !hasInfo}
                  >
                    {loading ? "Analysing with Gemini…" : "Generate Estimate"}
                  </Button>
                )}

                <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
                  No sign-up required · Photos analysed by Google Gemini AI
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
