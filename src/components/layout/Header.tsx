import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-stone/95 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="#" className="font-[Cinzel] text-cream text-sm tracking-[0.3em] uppercase">
            David Slings
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-stone-light text-xs tracking-[0.15em] uppercase hover:text-cream transition-colors">
              Shop
            </a>
            <a href="#story" className="text-stone-light text-xs tracking-[0.15em] uppercase hover:text-cream transition-colors">
              Story
            </a>
            <a href="#video" className="text-stone-light text-xs tracking-[0.15em] uppercase hover:text-cream transition-colors">
              Watch
            </a>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-cream"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-stone flex flex-col items-center justify-center gap-8"
          >
            {[
              { label: 'Shop', href: '#product' },
              { label: 'Story', href: '#story' },
              { label: 'Watch', href: '#video' },
            ].map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="font-[Cinzel] text-cream text-xl tracking-[0.2em] uppercase"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
