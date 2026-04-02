"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Car } from "lucide-react"

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
        <a href="#" className="flex items-center gap-2 group" aria-label="Hobart Auto Removal home">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e40af]">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#0f172a]">
            Hobart Auto
            <span className="text-xs font-normal opacity-60">Removal</span>
          </span>
        </a>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {[
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Why Us", href: "#faq" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-colors text-[#64748b] hover:text-[#0f172a]"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <Button
          onClick={scrollToQuote}
          className="font-semibold text-sm px-5 h-9 shadow-none border-0 text-white cursor-pointer bg-[#1e40af] hover:bg-[#1e3a8a]"
        >
          Get Quote
        </Button>
      </div>
    </header>
  )
}
