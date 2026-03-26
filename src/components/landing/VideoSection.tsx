import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useState } from 'react'

export default function VideoSection() {
  const [playing, setPlaying] = useState(false)

  // Replace with your actual YouTube/Vimeo video ID
  const VIDEO_ID = 'YOUR_VIDEO_ID'
  const hasVideo = VIDEO_ID !== 'YOUR_VIDEO_ID'

  return (
    <section id="video" className="relative py-24 md:py-36 overflow-hidden">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 md:px-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 md:mb-20"
        >
          <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-4">See It In Action</p>
          <h2 className="font-[Cinzel] text-cream text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Built to Sling
          </h2>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-video max-w-4xl mx-auto group"
        >
          {/* Decorative frame */}
          <div className="absolute -inset-3 md:-inset-4 border border-gold/15" />
          <div className="absolute -inset-1 border border-gold/5" />

          {/* Corner accents */}
          {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map(
            (pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-4 h-4 border-gold/40 ${
                  i < 2 ? 'border-t' : 'border-b'
                } ${i % 2 === 0 ? 'border-l' : 'border-r'}`}
              />
            )
          )}

          {playing && hasVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="relative w-full h-full bg-stone-warm flex items-center justify-center cursor-pointer overflow-hidden"
            >
              {/* Placeholder gradient */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    'radial-gradient(ellipse at center, #292524 0%, #1C1917 100%)',
                }}
              />

              {/* Play button */}
              <div className="relative z-10 flex flex-col items-center gap-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-gold/60 flex items-center justify-center group-hover:border-gold group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(139,105,20,0.2)]">
                  <Play
                    size={28}
                    className="text-gold ml-1 group-hover:scale-110 transition-transform duration-300"
                    fill="currentColor"
                  />
                </div>
                <span className="text-stone-light text-xs tracking-[0.3em] uppercase group-hover:text-cream transition-colors">
                  {hasVideo ? 'Play Video' : 'Video Coming Soon'}
                </span>
              </div>
            </button>
          )}
        </motion.div>
      </div>
    </section>
  )
}
