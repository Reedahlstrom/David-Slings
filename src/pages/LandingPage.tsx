import Header from '@/components/layout/Header'
import Hero from '@/components/landing/Hero'
import ProductShowcase from '@/components/landing/ProductShowcase'
import Craftsmanship from '@/components/landing/Craftsmanship'
import VideoSection from '@/components/landing/VideoSection'
import Footer from '@/components/layout/Footer'

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductShowcase />
        <Craftsmanship />
        <VideoSection />
      </main>
      <Footer />
    </>
  )
}
