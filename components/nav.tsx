"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PaintBucket } from "lucide-react"

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToQuote = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group" aria-label="HomePainters home">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0f172a" }}>
            <PaintBucket className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: "#0f172a" }}>
            HomePainters
            <span className="text-xs font-normal opacity-60">.co.nz</span>
          </span>
        </a>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {[
            { label: "Gallery", href: "#gallery" },
            { label: "Pricing", href: "#objections" },
            { label: "Guarantee", href: "#faq" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{ color: "#64748b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <Button
          onClick={scrollToQuote}
          className="font-semibold text-sm px-5 h-9 shadow-none border-0 text-white cursor-pointer"
          style={{ backgroundColor: "#f97316" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea6c0a")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f97316")}
        >
          Get My Quote
        </Button>
      </div>
    </header>
  )
}
