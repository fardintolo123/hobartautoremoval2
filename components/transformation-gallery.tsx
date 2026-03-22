"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"

const transformations = [
  {
    title: "The Dark-to-Light Refresh",
    before: "/images/before-living-room.jpg",
    after: "/images/after-living-room.jpg",
    story:
      "A cramped 1970s living room in Ponsonby transformed into a breathable, modern sanctuary using Resene 'Alabaster'.",
    result: "Home sold for $45k over asking.",
    tag: "Interior",
  },
  {
    title: "The Weather-Beaten Exterior",
    before: "/images/before-exterior.jpg",
    after: "/images/after-exterior.jpg",
    story: "Restored a sun-damaged villa deck — stripped, sanded, and triple-coated in premium exterior-grade finish.",
    result: "10 years of life added to the timber.",
    tag: "Exterior",
  },
  {
    title: "The Master Suite Revival",
    before: "/images/before-bedroom.jpg",
    after: "/images/after-bedroom.jpg",
    story:
      "A scuffed, dated rental bedroom reborn with warm greige tones, fresh white trim, and perfectly cut edges.",
    result: "Rental value increased by $80/week.",
    tag: "Interior",
  },
]

function BeforeAfterSlider({
  before,
  after,
  title,
}: {
  before: string
  after: string
  title: string
}) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    updatePosition(e.clientX)
    const onMove = (ev: MouseEvent) => { if (isDragging.current) updatePosition(ev.clientX) }
    const onUp = () => { isDragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const handleTouchMove = (e: React.TouchEvent) => updatePosition(e.touches[0].clientX)

  return (
    <div
      ref={containerRef}
      className="relative h-72 rounded-2xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onTouchMove={handleTouchMove}
      role="slider"
      aria-label={`Before and after slider for ${title}`}
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* After image (base) */}
      <Image src={after} alt={`After: ${title}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />

      {/* Before image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <Image src={before} alt={`Before: ${title}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 8L2 5l3-3M11 8l3 3-3 3" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3">
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
          Before
        </span>
      </div>
      <div className="absolute top-3 right-3">
        <span className="text-xs font-semibold px-2 py-1 rounded-full text-white backdrop-blur-sm" style={{ backgroundColor: "rgba(249,115,22,0.85)" }}>
          After
        </span>
      </div>
    </div>
  )
}

export function TransformationGallery() {
  return (
    <section id="gallery" className="py-24" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>
            Real results
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-balance" style={{ color: "#0f172a" }}>
            Transformations that speak for themselves
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "#64748b" }}>
            Drag the slider to reveal the before. Every project is Liam's personal guarantee.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {transformations.map((t) => (
            <article key={t.title} className="flex flex-col gap-5">
              <BeforeAfterSlider before={t.before} after={t.after} title={t.title} />
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>{t.title}</h3>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                  >
                    {t.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {t.story}
                </p>
                <p className="text-sm font-semibold mt-2" style={{ color: "#0f172a" }}>
                  Result: {t.result}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
