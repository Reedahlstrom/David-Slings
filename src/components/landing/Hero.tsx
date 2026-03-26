import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-stone p-6 sm:p-10">
      {/* Gradient panel with inset border — album cover feel */}
      <div
        className="relative w-full max-w-3xl aspect-square sm:aspect-[4/5] flex items-center justify-center rounded-sm"
        style={{
          background: 'linear-gradient(160deg, #292524 0%, #1C1917 40%, #2a1f0f 100%)',
        }}
      >
        {/* Inset border */}
        <div className="absolute inset-4 sm:inset-6 md:inset-10 border border-cream/15 rounded-sm" />

        {/* Centered text */}
        <div className="relative z-10 text-center px-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="font-[Cinzel] text-cream text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[0.9]"
          >
            David Slings
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="text-cream/40 text-sm sm:text-base mt-5 tracking-wide font-light"
          >
            Modern day slings from an ancient story
          </motion.p>
        </div>
      </div>

      {/* Scroll arrow below the panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-6"
      >
        <motion.a
          href="#product"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown size={16} className="text-stone-light/30" />
        </motion.a>
      </motion.div>
    </section>
  )
}
