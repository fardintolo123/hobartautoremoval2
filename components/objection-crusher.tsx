import { Card } from "@/components/ui/card"
import { Shield, Clock, DollarSign, CheckCircle2 } from "lucide-react"

const objections = [
  {
    icon: Shield,
    tag: "The Mess",
    headline: "The Clean-Site Protocol",
    copy: "We use HEPA-filtered sanders and floor-to-ceiling taping. We leave your home cleaner than we found it.",
    proof: "Zero damage claims in 6 years of operation.",
  },
  {
    icon: Clock,
    tag: "The Timeline",
    headline: "On-Time or We Pay",
    copy: "Every job gets a written schedule. If we run over by more than one day, we discount your invoice by 5% — automatically.",
    proof: "97% of jobs completed on or ahead of schedule.",
  },
  {
    icon: DollarSign,
    tag: "The Cost",
    headline: "The Fixed-Price Lock",
    copy: "The quote the AI generates (and we verify) is the price you pay. Period. No hidden materials surcharges, no surprise extras.",
    proof: "Fixed-price guaranteed — no asterisks.",
  },
]

const pricing = [
  { label: "The Single Room", desc: "Prep, two coats & cleanup", price: "From $550" },
  { label: "The Full Interior", desc: "Complete 3-bed home", price: "From $4,500" },
  { label: "The Exterior Refresh", desc: "Weatherboard repair + premium coat", price: "From $6,200" },
]

export function ObjectionCrusher() {
  return (
    <section id="objections" className="py-24" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>
            Every concern, answered
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-balance" style={{ color: "#0f172a" }}>
            We've heard the objections. Here's our answer.
          </h2>
        </div>

        {/* Objection cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {objections.map(({ icon: Icon, tag, headline, copy, proof }) => (
            <Card
              key={tag}
              className="p-8 border border-slate-100 shadow-none hover:shadow-lg transition-shadow duration-300 rounded-2xl"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: "#fff7ed" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#f97316" }} />
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#94a3b8" }}
              >
                {tag}
              </span>
              <h3 className="font-semibold text-lg mt-1 mb-3" style={{ color: "#0f172a" }}>
                {headline}
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748b" }}>
                {copy}
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#f97316" }} />
                <span className="text-xs font-medium" style={{ color: "#0f172a" }}>{proof}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Anchor pricing */}
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{ backgroundColor: "#0f172a" }}
        >
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>
              Anchor pricing
            </p>
            <h3 className="font-serif text-3xl text-white text-balance">
              Transparent from the start
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ label, desc, price }) => (
              <div
                key={label}
                className="rounded-xl p-6 border border-white/10 bg-white/5 flex flex-col gap-2"
              >
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                  {label}
                </span>
                <span className="text-sm" style={{ color: "#cbd5e1" }}>{desc}</span>
                <span className="text-2xl font-bold mt-auto pt-4" style={{ color: "#f97316" }}>
                  {price}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
            All prices include GST · Final quote confirmed after Liam's on-site assessment
          </p>
        </div>
      </div>
    </section>
  )
}
