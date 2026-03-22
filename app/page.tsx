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
      <LeadForm />
      <FaqSection />
      <Footer />
    </main>
  )
}
