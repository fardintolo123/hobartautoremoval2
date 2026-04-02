"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Star, Phone } from "lucide-react"

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-16"
      style={{ backgroundColor: "#1e40af" }}
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
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#60a5fa" }} />
              <span className="text-xs font-medium text-white/70">
                Hobart Auto Removal — Top-Rated Car Buyers Since 2008
              </span>
            </div>

            <h1
              className="font-serif text-5xl lg:text-6xl xl:text-7xl leading-tight text-balance text-white mb-6"
            >
              Get instant cash for your unwanted car. <span style={{ color: "#60a5fa" }}>Free removal today.</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: "#cbd5e1" }}>
              Hobart Auto Removal pays top dollar for unwanted, damaged, and scrap cars. Free pickup anywhere in Hobart and Tasmania. Instant payment. No paperwork hassle.
            </p>

            <div className="flex flex-wrap gap-4 text-sm mb-8">
              {[
                "Instant cash payment",
                "Free car removal",
                "Any make or condition",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#60a5fa" }} />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
                className="font-semibold px-6 h-11 text-white cursor-pointer bg-[#0284c7] hover:bg-[#0369a1]"
              >
                Get Your Quote
              </Button>
              <a href="tel:0419331319">
                <Button
                  variant="outline"
                  className="font-semibold px-6 h-11 border-white/30 text-white hover:bg-white/10"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call 0419 331 319
                </Button>
              </a>
            </div>
          </div>

          {/* Right — Quick stats card */}
          <div>
            <Card
              className="border-0 shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-semibold text-lg" style={{ color: "#1e40af" }}>
                      Quick Car Quote
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                      Tell us about your car
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#dbeafe" }}
                  >
                    <span className="text-lg font-bold" style={{ color: "#1e40af" }}>🚗</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-block mb-2" style={{ color: "#0f172a" }}>
                      Your vehicle condition
                    </label>
                    <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                      We buy cars in any condition — running or not, damaged, wrecked, unregistered. All makes and models welcome.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
                        Why Choose Us
                      </p>
                      {[
                        "Instant payment",
                        "Free removal & towing",
                        "Same-day pickup",
                        "Fair, competitive quotes"
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#0284c7" }} />
                          <span className="text-sm" style={{ color: "#0f172a" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full mt-6 font-semibold h-11 text-white shadow-none border-0 cursor-pointer bg-[#1e40af] hover:bg-[#1e3a8a]"
                >
                  Get Free Quote
                </Button>

                <p className="text-center text-xs mt-3" style={{ color: "#94a3b8" }}>
                  Free estimate · Takes 2 minutes · No obligation
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
