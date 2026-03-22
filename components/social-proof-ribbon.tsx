export function SocialProofRibbon() {
  const brands = [
    { name: "Resene", tagline: "Official Colour Partner" },
    { name: "Dulux", tagline: "Premium Paint Supplier" },
    { name: "Master Painters NZ", tagline: "Certified Member" },
    { name: "Site Safe", tagline: "Health & Safety Certified" },
  ]

  return (
    <section className="py-12 border-y border-slate-100" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: "#94a3b8" }}>
          Trusted by Auckland homeowners · Certified by industry leaders
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {brands.map(({ name, tagline }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 opacity-50 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-300"
            >
              <div
                className="h-10 flex items-center justify-center px-4 rounded-lg"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <span
                  className="font-bold text-lg tracking-tight"
                  style={{ color: "#0f172a" }}
                >
                  {name}
                </span>
              </div>
              <span className="text-xs text-center" style={{ color: "#64748b" }}>{tagline}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
