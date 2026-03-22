import { PaintBucket, MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0f172a]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Col 1 — Contact */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(249,115,22,0.15)]">
                <PaintBucket className="w-3.5 h-3.5 text-[#f97316]" />
              </div>
              <span className="font-semibold text-sm text-white">
                HomePainters
                <span className="text-xs font-normal opacity-50">.co.nz</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-[#475569]">
              Auckland&apos;s most precise residential painters. Led by Liam &apos;The Detail&apos; Walsh.
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+6421123456"
                  className="flex items-center gap-3 text-sm transition-colors text-[#64748b] hover:text-[#f97316]"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  021 123 456
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@homepainters.co.nz"
                  className="flex items-center gap-3 text-sm transition-colors text-[#64748b] hover:text-[#f97316]"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  hello@homepainters.co.nz
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#475569]">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#64748b]" />
                <span>Serving all of Auckland &amp; North Shore, New Zealand</span>
              </li>
            </ul>
          </div>

          {/* Col 2 — Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5 text-[#94a3b8]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Estimate Tool", href: "#hero" },
                { label: "Gallery", href: "#gallery" },
                { label: "Pricing", href: "#objections" },
                { label: "Guarantee", href: "#faq" },
                { label: "Book a Call", href: "#lead-form" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm transition-colors text-[#64748b] hover:text-[#f97316]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 text-[#94a3b8]">
                Follow Along
              </h3>
              <div className="flex gap-3">
                {[
                  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/10 transition-all text-[#64748b] hover:text-[#f97316] hover:border-[rgba(249,115,22,0.4)]"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3 — Made for NZ badge */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5 text-[#94a3b8]">
              Made for NZ Homes
            </h3>
            <div className="rounded-xl p-5 border border-white/10 mb-6 bg-[rgba(255,255,255,0.03)]">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#f97316]" />
                <div>
                  <p className="text-sm font-semibold text-white">Auckland, New Zealand</p>
                  <p className="text-xs mt-1 text-[#475569]">
                    Our estimates use local NZ labour rates, GST, and Auckland&apos;s specific weather
                    conditions to give you the most accurate quote possible.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-3 text-[#94a3b8]">
                Legal
              </h3>
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-sm transition-colors text-[#475569] hover:text-[#64748b]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#334155]">
            &copy; {new Date().getFullYear()} HomePainters.co.nz · All rights reserved
          </p>
          <p className="text-xs text-[#334155]">
            Built with obsessive precision — just like our paint jobs
          </p>
        </div>
      </div>
    </footer>
  )
}
