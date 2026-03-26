import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 bg-stone" />

      {/* Radial golden glow — like museum spotlight */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #8B6914 0%, transparent 70%)',
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative horizontal lines */}
      <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      <div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gold/70 text-xs tracking-[0.4em] uppercase mb-8 font-medium"
        >
          Handcrafted &bull; Ancient &bull; Lethal
        </motion.p>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-[Cinzel] text-cream leading-[0.95] tracking-tight"
        >
          <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold">
            The Weapon
          </span>
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-gold mt-2 md:mt-4 tracking-[0.05em]">
            That Changed History
          </span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-px bg-gold mx-auto my-8 md:my-10 origin-center"
        />

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-stone-light text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
        >
          A shepherd's weapon brought down a giant. Now, own a piece of
          the most legendary combat tool ever wielded — handcrafted from
          authentic materials, built to sling.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#product"
            className="group relative px-10 py-4 bg-gold text-stone font-[Cinzel] text-sm tracking-[0.2em] uppercase font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,105,20,0.3)]"
          >
            <span className="relative z-10">Claim Yours</span>
            <div className="absolute inset-0 bg-gold-light translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
          <a
            href="#video"
            className="px-10 py-4 text-stone-light text-sm tracking-[0.2em] uppercase border border-stone-mid hover:border-gold/40 hover:text-cream transition-all duration-300"
          >
            Watch Demo
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-stone-light text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} className="text-gold/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}
