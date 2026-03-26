import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useState } from 'react'

export default function VideoSection() {
  const [playing, setPlaying] = useState(false)

  const VIDEO_ID = 'YOUR_VIDEO_ID'
  const hasVideo = VIDEO_ID !== 'YOUR_VIDEO_ID'

  return (
    <section id="video" className="py-24 md:py-32 bg-stone-warm">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-[Cinzel] text-cream text-2xl md:text-3xl font-bold tracking-tight">
            See It In Action
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="aspect-video"
        >
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
              className="w-full h-full bg-stone flex items-center justify-center group cursor-pointer"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-cream/20 flex items-center justify-center group-hover:border-cream/40 transition-colors">
                  <Play size={20} className="text-cream/60 ml-0.5" fill="currentColor" />
                </div>
                <span className="text-stone-light/40 text-xs tracking-[0.2em] uppercase">
                  {hasVideo ? 'Play' : 'Coming Soon'}
                </span>
              </div>
            </button>
          )}
        </motion.div>
      </div>
    </section>
  )
}
