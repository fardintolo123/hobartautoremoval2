import Script from "next/script"
import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { SocialProofRibbon } from "@/components/social-proof-ribbon"
import { TransformationGallery } from "@/components/transformation-gallery"
import { ObjectionCrusher } from "@/components/objection-crusher"
import { QuotePricingExamples } from "@/components/quote-pricing-examples"
import { QuoteCalculator } from "@/components/quote-calculator"
import { LeadForm } from "@/components/lead-form"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <SocialProofRibbon />
      <TransformationGallery />
      <ObjectionCrusher />
      <QuotePricingExamples />
      <QuoteCalculator />
      <section className="max-w-4xl mx-auto px-4 py-8">
        {/* Calendly inline widget */}
        <div
          className="calendly-inline-widget"
          data-url="https://calendly.com/bspokcleaning/30min"
          style={{ minWidth: 320, height: 700 }}
        />
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </section>
      <LeadForm />
      <FaqSection />
      <Footer />
    </main>
  )
}
