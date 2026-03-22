"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Sparkles, CheckCircle2, Star } from "lucide-react"
import { cn } from "@/lib/utils"

function ShimmerEstimate() {
  return (
    <div className="space-y-3 py-2 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4" style={{ color: "#f97316" }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#f97316" }}>
          AI Estimate Generated
        </span>
      </div>
      {[
        { label: "Surface preparation", value: "$320" },
        { label: "Two premium coats (Resene)", value: "$680" },
        { label: "Clean-up & protection", value: "$90" },
      ].map((line) => (
        <div key={line.label} className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-sm" style={{ color: "#64748b" }}>{line.label}</span>
          <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>{line.value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <span className="font-bold" style={{ color: "#0f172a" }}>Estimated Total</span>
        <span className="text-xl font-bold" style={{ color: "#f97316" }}>$1,090</span>
      </div>
      <p className="text-xs mt-1" style={{ color: "#64748b" }}>
        Within 10–15% accuracy · Based on NZ local data · Liam verifies every quote
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
          Analysing your space…
        </span>
      </div>
      {[80, 60, 70].map((w, i) => (
        <div
          key={i}
          className="h-8 rounded-lg animate-pulse"
          style={{
            background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
            backgroundSize: "200% 100%",
            animation: `shimmer 1.5s infinite ${i * 0.2}s`,
            width: `${w}%`,
          }}
        />
      ))}
    </div>
  )
}

export function Hero() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [estimated, setEstimated] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setLoading(true)
    setEstimated(false)
    setTimeout(() => {
      setLoading(false)
      setEstimated(true)
    }, 2800)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) handleFile(picked)
  }

  return (
    <section
      className="relative min-h-screen flex items-center pt-16"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Subtle grid pattern */}
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
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#f97316" }} />
              <span className="text-xs font-medium text-white/70">
                Liam 'The Detail' Walsh — Auckland's most precise painter
              </span>
            </div>

            <h1
              className="font-serif text-5xl lg:text-6xl xl:text-7xl leading-tight text-balance text-white mb-6"
            >
              Get a precise painting estimate in{" "}
              <span style={{ color: "#f97316" }}>60 seconds.</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: "#94a3b8" }}>
              Upload a photo of your room or exterior. Our AI analyses your space and generates a
              fixed-price estimate — backed by thousands of Auckland project data points.
            </p>

            <div className="flex flex-wrap gap-4 text-sm" style={{ color: "#64748b" }}>
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

          {/* Right — AI Uploader card */}
          <div>
            <Card
              className="border-0 shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: "#0f172a" }}>
                      Magic AI Estimator
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      Drop a photo — get an instant quote
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#fff7ed" }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: "#f97316" }} />
                  </div>
                </div>

                {/* Drop zone */}
                {!loading && !estimated && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "w-full rounded-xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center gap-3 cursor-pointer",
                      isDragging
                        ? "border-orange-400 bg-orange-50"
                        : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/40"
                    )}
                    aria-label="Upload a photo of your room"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#fff7ed" }}
                    >
                      <Upload className="w-5 h-5" style={{ color: "#f97316" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
                        {file ? file.name : "Drop your photo here"}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        or click to browse · JPG, PNG, HEIC
                      </p>
                    </div>
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                  aria-label="File input"
                />

                {loading && <LoadingShimmer />}
                {estimated && <ShimmerEstimate />}

                <Button
                  className="w-full mt-5 font-semibold h-11 text-white shadow-none border-0 cursor-pointer"
                  style={{ backgroundColor: "#f97316" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea6c0a")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f97316")}
                  onClick={() => {
                    if (!file) fileRef.current?.click()
                    else document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  {estimated ? "Lock In This Estimate" : "Generate Estimate"}
                </Button>

                <p className="text-center text-xs mt-3" style={{ color: "#94a3b8" }}>
                  No sign-up required · Result in under 60 seconds
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  )
}
