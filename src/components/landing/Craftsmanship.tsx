import { motion } from 'framer-motion'

const FEATURES = [
  {
    title: 'Handcrafted',
    description: 'Every sling is cut, stitched, and braided by hand. No two are identical.',
  },
  {
    title: 'Authentic',
    description: 'Modeled after ancient Judean slings dating back to 1000 BCE.',
  },
  {
    title: 'Durable',
    description: 'Full-grain leather and military-grade 550 paracord. Built to last.',
  },
  {
    title: 'Functional',
    description: 'Not a replica. A real sling capable of launching projectiles accurately.',
  },
]

export default function Craftsmanship() {
  return (
    <section id="story" className="py-24 md:py-32 bg-stone">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-[Cinzel] text-cream text-2xl md:text-3xl font-bold tracking-tight">
            Built Different
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-x-16 gap-y-12">
          {FEATURES.map(({ title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <h3 className="text-cream text-sm font-semibold tracking-wide mb-2">
                {title}
              </h3>
              <p className="text-stone-light/60 text-sm leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 text-center max-w-2xl mx-auto"
        >
          <p className="font-[Cinzel] text-cream/60 text-lg md:text-xl leading-relaxed italic">
            "David put his hand in his bag and took out a stone and slung it
            and struck the Philistine on his forehead."
          </p>
          <cite className="block text-stone-light/30 text-xs tracking-[0.2em] uppercase mt-4 not-italic">
            1 Samuel 17:49
          </cite>
        </motion.blockquote>
      </div>
    </section>
  )
}
