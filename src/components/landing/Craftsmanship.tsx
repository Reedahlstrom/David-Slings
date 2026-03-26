import { motion } from 'framer-motion'
import { Hand, Flame, History, Target } from 'lucide-react'

const FEATURES = [
  {
    icon: Hand,
    title: 'Handcrafted',
    description:
      'Every sling is cut, stitched, and braided by hand. No two are identical — each carries the marks of its maker.',
  },
  {
    icon: History,
    title: 'Historically Authentic',
    description:
      'Modeled after ancient Judean slings dating back to 1000 BCE. The same design that felled Goliath of Gath.',
  },
  {
    icon: Flame,
    title: 'Battle-Tested Materials',
    description:
      'Full-grain leather pouch with military-grade 550 paracord. Built to withstand thousands of throws.',
  },
  {
    icon: Target,
    title: 'Functional Weapon',
    description:
      'This is not a replica or a toy. It\'s a real sling capable of launching projectiles with devastating accuracy.',
  },
]

export default function Craftsmanship() {
  return (
    <section id="craft" className="relative py-24 md:py-36 bg-stone-warm">
      {/* Border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-4">
            Craftsmanship
          </p>
          <h2 className="font-[Cinzel] text-cream text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Forged by Tradition
          </h2>
          <p className="text-stone-light text-base md:text-lg mt-4 max-w-xl mx-auto font-light">
            Ancient artistry meeting modern durability. Every detail is intentional.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative p-8 bg-stone border border-gold/5 hover:border-gold/20 transition-all duration-500"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 border border-gold/20 flex items-center justify-center mb-6 group-hover:border-gold/40 transition-colors duration-300">
                  <Icon
                    size={20}
                    className="text-gold/60 group-hover:text-gold transition-colors duration-300"
                  />
                </div>
                <h3 className="font-[Cinzel] text-cream text-base font-semibold tracking-wide mb-3">
                  {title}
                </h3>
                <p className="text-stone-light text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 md:mt-28 text-center max-w-3xl mx-auto"
        >
          <div className="w-12 h-px bg-gold/30 mx-auto mb-8" />
          <blockquote className="font-[Cinzel] text-cream/80 text-xl md:text-2xl leading-relaxed italic">
            "David put his hand in his bag and took out a stone and slung it
            and struck the Philistine on his forehead."
          </blockquote>
          <cite className="block text-gold/50 text-xs tracking-[0.3em] uppercase mt-6 not-italic">
            1 Samuel 17:49
          </cite>
        </motion.div>
      </div>
    </section>
  )
}
