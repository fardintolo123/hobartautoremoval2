"use client"

import { useState } from "react"
import Script from "next/script"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ArrowRight } from "lucide-react"

function CalendlyScript() {
  return (
    <Script
      src="https://assets.calendly.com/assets/external/widget.js"
      strategy="lazyOnload"
    />
  )
}

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) return
    setSubmitted(true)
  }

  return (
    <section id="lead-form" className="py-24" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mx-auto">
          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>
                  Book your free assessment
                </p>
                <h2 className="font-serif text-4xl lg:text-5xl text-balance" style={{ color: "#0f172a" }}>
                  Lock in your estimate today
                </h2>
                <p className="mt-4 text-base leading-relaxed" style={{ color: "#64748b" }}>
                  Liam reviews every AI estimate personally and will reach out within 2 hours during business hours.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-5"
                noValidate
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium" style={{ color: "#0f172a" }}>
                    Full name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="h-11 border-slate-200 focus-visible:ring-orange-300 focus-visible:border-orange-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: "#0f172a" }}>
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.co.nz"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="h-11 border-slate-200 focus-visible:ring-orange-300 focus-visible:border-orange-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium" style={{ color: "#0f172a" }}>
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="021 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="h-11 border-slate-200 focus-visible:ring-orange-300 focus-visible:border-orange-400"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold text-white shadow-none border-0 gap-2 cursor-pointer bg-[#f97316] hover:bg-[#ea6c0a]"
                >
                  Confirm My Estimate
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
                  No obligation · Your details are never sold
                </p>
              </form>
            </>
          ) : (
            /* Calendly embed revealed on submission */
            <div className="animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#fff7ed" }}
                >
                  <CheckCircle2 className="w-7 h-7" style={{ color: "#f97316" }} />
                </div>
                <h3 className="font-serif text-3xl mb-2" style={{ color: "#0f172a" }}>
                  You're on Liam's list.
                </h3>
                <p className="text-base leading-relaxed" style={{ color: "#64748b" }}>
                  Pick a time that suits you and Liam will confirm your quote on the call.
                </p>
              </div>

              {/* Calendly inline widget */}
              <div
                className="calendly-inline-widget rounded-2xl overflow-hidden shadow-sm border border-slate-100"
                data-url="https://calendly.com/bspokcleaning/30min"
                style={{ minWidth: "320px", height: "700px" }}
              />
              <CalendlyScript />
              <p className="text-center text-xs mt-3" style={{ color: "#94a3b8" }}>
                Can't find a time? Email us at{" "}
                <a href="mailto:hello@homepainters.co.nz" style={{ color: "#f97316" }}>
                  hello@homepainters.co.nz
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
