export default function Footer() {
  return (
    <footer className="py-12 bg-stone border-t border-cream/5">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-stone-light/30 text-xs">
          &copy; {new Date().getFullYear()} David Slings
        </p>
        <div className="flex items-center gap-6 text-stone-light/30 text-xs">
          <span>Free shipping</span>
          <span>30-day returns</span>
          <a href="mailto:contact@david-slings.com" className="hover:text-cream transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
