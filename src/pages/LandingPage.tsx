import Header from '@/components/layout/Header'
import Hero from '@/components/landing/Hero'
import VideoSection from '@/components/landing/VideoSection'
import ProductShowcase from '@/components/landing/ProductShowcase'
import Craftsmanship from '@/components/landing/Craftsmanship'
import Footer from '@/components/layout/Footer'

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductShowcase />
        <VideoSection />
        <Craftsmanship />
      </main>
      <Footer />
    </>
  )
}
