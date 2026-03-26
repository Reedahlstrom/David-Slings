import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowLeft, Package } from 'lucide-react'

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')

  return (
    <div className="min-h-screen bg-stone flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-8 border-2 border-gold/40 rounded-full flex items-center justify-center"
        >
          <CheckCircle size={36} className="text-gold" />
        </motion.div>

        <h1 className="font-[Cinzel] text-cream text-3xl md:text-4xl font-bold mb-4">
          Order Confirmed
        </h1>

        <div className="w-12 h-px bg-gold/40 mx-auto my-6" />

        <p className="text-stone-light text-base leading-relaxed mb-8">
          Your David Sling is being prepared for shipment. You'll receive a
          confirmation email with tracking details once it ships.
        </p>

        {/* Order details */}
        <div className="bg-stone-warm border border-gold/10 p-6 text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-gold/60" />
            <span className="text-cream text-xs tracking-[0.2em] uppercase font-semibold">
              What's Next
            </span>
          </div>
          <ul className="space-y-3 text-stone-light text-sm">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 bg-gold/10 text-gold text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                1
              </span>
              Order confirmation email sent to your inbox
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 bg-gold/10 text-gold text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                2
              </span>
              Your sling is handcrafted (1-2 business days)
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 bg-gold/10 text-gold text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                3
              </span>
              Ships with tracking (3-5 business days delivery)
            </li>
          </ul>
        </div>

        {sessionId && (
          <p className="text-stone-light/40 text-xs mb-6 font-mono">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gold text-sm tracking-[0.15em] uppercase hover:text-gold-light transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
