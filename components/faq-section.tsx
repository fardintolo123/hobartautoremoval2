import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ShieldCheck } from "lucide-react"

const faqs = [
  {
    q: "How accurate is the AI estimate?",
    a: "It's within 10–15% of the final cost, based on thousands of local NZ project data points. Liam then personally reviews every AI estimate and does a free on-site check before issuing the final fixed-price quote.",
  },
  {
    q: "Do I need to move my furniture?",
    a: "No. Our 'White Glove' service includes furniture moving and protection as standard. We wrap, pad, and relocate everything — and put it all back when we're done.",
  },
  {
    q: "What paint brands do you use?",
    a: "We are official partners with Resene and Dulux — both top-rated for the NZ climate. We recommend Resene for interiors and Dulux Weathershield for exteriors, but we'll work with your preference.",
  },
  {
    q: "How long does a typical interior job take?",
    a: "A single room takes 1–2 days. A full 3-bedroom interior typically runs 4–6 days. We provide a written schedule before any work begins and stick to it.",
  },
  {
    q: "What does the 5-year no-peel warranty cover?",
    a: "If your paint bubbles, cracks, or peels within 5 years of completion, we come back and fix it for free — no questions asked. This applies to all interior and exterior jobs we complete.",
  },
  {
    q: "Do you do commercial work?",
    a: "We specialise exclusively in residential painting for Auckland homeowners and investors. This focus means we've refined our process to deliver a level of precision and care that commercial-first companies simply can't match.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-24" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* FAQ */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>
              FAQ
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl text-balance mb-10" style={{ color: "#0f172a" }}>
              Questions we get asked a lot
            </h2>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map(({ q, a }, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-slate-100 rounded-xl px-5 data-[state=open]:border-orange-200 transition-colors"
                >
                  <AccordionTrigger
                    className="text-sm font-semibold py-4 text-left hover:no-underline"
                    style={{ color: "#0f172a" }}
                  >
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed pb-4" style={{ color: "#64748b" }}>
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Guarantee badge */}
          <div className="lg:sticky lg:top-24">
            <div
              className="rounded-2xl p-10 text-center"
              style={{ backgroundColor: "#0f172a" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "rgba(249,115,22,0.15)" }}
              >
                <ShieldCheck className="w-8 h-8" style={{ color: "#f97316" }} />
              </div>
              <h3 className="font-serif text-2xl text-white mb-3">
                The No-Guesswork Guarantee
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#94a3b8" }}>
                The quote we generate is the price you pay. If your paint bubbles, cracks, or peels within 5 years,
                we come back and fix it for free. No questions asked.
              </p>

              <div
                className="rounded-xl p-5 text-left space-y-3"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {[
                  "Fixed-price quote — locked in writing",
                  "5-year no-peel warranty",
                  "HEPA clean-site every time",
                  "On-time delivery or we discount",
                  "Liam personally reviews every job",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(249,115,22,0.2)" }}>
                      <span className="text-xs font-bold" style={{ color: "#f97316" }}>✓</span>
                    </div>
                    <span className="text-sm" style={{ color: "#cbd5e1" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
