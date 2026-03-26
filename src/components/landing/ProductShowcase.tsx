import { motion } from 'framer-motion'
import { useState } from 'react'
import { redirectToCheckout } from '@/lib/stripe'

const PRODUCT = {
  name: 'The David Sling',
  price: 25,
  description:
    'Handcrafted from full-grain leather and military-grade paracord. A functional recreation of the most famous weapon in history.',
  details: [
    'Full-grain leather pouch',
    '550 paracord cords',
    'Finger loop for secure release',
    'Includes 5 river stones',
  ],
}

export default function ProductShowcase() {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try {
      await redirectToCheckout(1)
    } catch {
      setLoading(false)
    }
  }

  return (
    <section id="product" className="py-24 md:py-32 bg-stone">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-square bg-stone-warm flex items-center justify-center">
              {/* Replace with: <img src="/images/sling.jpg" alt="The David Sling" className="w-full h-full object-cover" /> */}
              <p className="text-stone-light/20 text-xs tracking-[0.2em] uppercase">
                Image Coming Soon
              </p>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h2 className="font-[Cinzel] text-cream text-2xl md:text-3xl font-bold tracking-tight">
              {PRODUCT.name}
            </h2>

            <p className="text-gold text-2xl font-[Cinzel] font-bold mt-4">
              ${PRODUCT.price}
            </p>

            <p className="text-stone-light text-sm leading-relaxed mt-6">
              {PRODUCT.description}
            </p>

            <ul className="mt-6 space-y-2">
              {PRODUCT.details.map((detail) => (
                <li key={detail} className="text-stone-light/70 text-sm flex items-center gap-2">
                  <span className="w-1 h-1 bg-gold/60 rounded-full" />
                  {detail}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleBuy}
                disabled={loading}
                className="px-8 py-3 bg-cream text-stone text-xs tracking-[0.2em] uppercase font-semibold hover:bg-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Buy Now'}
              </button>
              <span className="text-stone-light/40 text-xs">Free shipping</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
