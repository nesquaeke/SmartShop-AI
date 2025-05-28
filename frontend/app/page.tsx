import { HeroSection } from '@/components/sections/hero-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { StatsSection } from '@/components/sections/stats-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { PriceComparisonDemo } from '@/components/sections/price-comparison-demo'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <PriceComparisonDemo />
      <StatsSection />
      <TestimonialsSection />
    </div>
  )
} 