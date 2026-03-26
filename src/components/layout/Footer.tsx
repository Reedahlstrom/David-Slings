import { Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-stone border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center">
                <span className="font-[Cinzel] text-gold text-sm font-bold">D</span>
              </div>
              <span className="font-[Cinzel] text-cream text-sm tracking-[0.2em] uppercase">
                David Slings
              </span>
            </div>
            <p className="text-stone-light text-sm leading-relaxed max-w-xs">
              Handcrafted slings inspired by the weapon that changed history.
              Built for those who respect ancient craftsmanship.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-cream text-xs tracking-[0.2em] uppercase mb-2 font-semibold">
              Quick Links
            </h4>
            <a href="#product" className="text-stone-light text-sm hover:text-cream transition-colors">
              The Weapon
            </a>
            <a href="#craft" className="text-stone-light text-sm hover:text-cream transition-colors">
              Craftsmanship
            </a>
            <a href="#video" className="text-stone-light text-sm hover:text-cream transition-colors">
              Watch Demo
            </a>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-cream text-xs tracking-[0.2em] uppercase mb-4 font-semibold">
              Shipping & Contact
            </h4>
            <div className="space-y-3 text-stone-light text-sm">
              <p>Free shipping on all orders (US &amp; Canada)</p>
              <p>Ships within 3-5 business days</p>
              <p>30-day return guarantee</p>
              <a
                href="mailto:contact@david-slings.com"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mt-2"
              >
                <Mail size={14} />
                contact@david-slings.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-stone-mid/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-light/50 text-xs">
            &copy; {new Date().getFullYear()} David Slings. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-stone-light/50 text-xs">
            <a href="#" className="hover:text-cream transition-colors">Privacy</a>
            <a href="#" className="hover:text-cream transition-colors">Terms</a>
            <a href="#" className="hover:text-cream transition-colors">Refunds</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
