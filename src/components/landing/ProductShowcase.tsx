import { motion } from 'framer-motion'
import { Shield, Ruler, Weight, Crosshair } from 'lucide-react'
import { useState } from 'react'
import { redirectToCheckout } from '@/lib/stripe'

const SPECS = [
  { icon: Ruler, label: 'Length', value: '30"' },
  { icon: Weight, label: 'Weight', value: '3.2 oz' },
  { icon: Shield, label: 'Material', value: 'Genuine Leather' },
  { icon: Crosshair, label: 'Range', value: '200+ yards' },
]

// Update these with your actual product details
const PRODUCT = {
  name: 'The David Sling',
  tagline: 'Shepherd\'s weapon. Giant killer.',
  price: 49.99,
  description:
    'Each sling is handcrafted from premium full-grain leather with braided paracord cords. Designed for both authentic slinging and display. This is not a toy — it\'s a functional recreation of the most famous weapon in history.',
  features: [
    'Full-grain leather pouch, hand-cut and stitched',
    'Military-grade 550 paracord cords',
    'Finger loop for secure release',
    'Includes 5 natural river stones',
    'Comes with leather care guide',
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
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <section id="product" className="relative py-24 md:py-36">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-4">
            The Weapon
          </p>
          <h2 className="font-[Cinzel] text-cream text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {PRODUCT.name}
          </h2>
          <p className="text-stone-light text-lg mt-3 font-light italic">
            {PRODUCT.tagline}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Product image area */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Image placeholder — replace with actual product photos */}
            <div className="relative aspect-square bg-stone-warm border border-gold/10 overflow-hidden">
              {/* Museum spotlight effect */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 30%, rgba(139,105,20,0.08) 0%, transparent 60%)',
                }}
              />

              {/* Placeholder content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-32 h-32 border border-gold/20 rounded-full flex items-center justify-center">
                  <span className="font-[Cinzel] text-gold/40 text-5xl font-bold">D</span>
                </div>
                <p className="text-stone-light/50 text-xs tracking-[0.2em] uppercase">
                  Product Image
                </p>
              </div>

              {/* Corner details */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/20" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/20" />
            </div>

            {/* Specs bar */}
            <div className="grid grid-cols-4 mt-4 gap-2">
              {SPECS.map(({ icon: Icon, label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="bg-stone-warm border border-gold/5 p-3 text-center"
                >
                  <Icon size={14} className="text-gold/60 mx-auto mb-1.5" />
                  <p className="text-cream text-xs font-semibold">{value}</p>
                  <p className="text-stone-light text-[10px] tracking-wider uppercase mt-0.5">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-[Cinzel] text-gold text-4xl md:text-5xl font-bold">
                ${PRODUCT.price}
              </span>
              <span className="text-stone-light text-sm tracking-wider uppercase">
                + Free Shipping
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-light text-base leading-relaxed mb-8">
              {PRODUCT.description}
            </p>

            {/* Divider */}
            <div className="w-16 h-px bg-gold/30 mb-8" />

            {/* Features list */}
            <ul className="space-y-3 mb-10">
              {PRODUCT.features.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 + 0.2 }}
                  className="flex items-start gap-3 text-cream/80 text-sm"
                >
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 shrink-0" />
                  {feature}
                </motion.li>
              ))}
            </ul>

            {/* Buy button */}
            <button
              onClick={handleBuy}
              disabled={loading}
              className="group relative w-full sm:w-auto px-14 py-5 bg-gold text-stone font-[Cinzel] text-sm tracking-[0.2em] uppercase font-bold overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(139,105,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {loading ? 'Preparing...' : 'Buy Now — Secure Checkout'}
              </span>
              <div className="absolute inset-0 bg-gold-light translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <p className="text-stone-light/60 text-xs mt-4 flex items-center gap-2">
              <Shield size={12} />
              Stripe-secured payment &bull; 30-day return guarantee
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
