import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check if user is in admin_users table
    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .single()

    if (!admin) {
      await supabase.auth.signOut()
      setError('You do not have admin access.')
      setLoading(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-stone flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto mb-4 border border-gold/40 rounded-full flex items-center justify-center">
            <span className="font-[Cinzel] text-gold text-xl font-bold">D</span>
          </div>
          <h1 className="font-[Cinzel] text-cream text-xl tracking-[0.15em] uppercase">
            Admin
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error text-sm px-4 py-3">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="text-stone-light text-xs tracking-[0.15em] uppercase block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-stone-warm border border-stone-mid text-cream px-4 py-3 text-sm focus:border-gold/40 focus:outline-none transition-colors"
              placeholder="admin@david-slings.com"
            />
          </div>

          <div>
            <label className="text-stone-light text-xs tracking-[0.15em] uppercase block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-stone-warm border border-stone-mid text-cream px-4 py-3 text-sm focus:border-gold/40 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gold text-stone font-[Cinzel] text-sm tracking-[0.15em] uppercase font-semibold px-6 py-3 hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <LogIn size={14} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <a
          href="/"
          className="block text-center text-stone-light/50 text-xs mt-8 hover:text-cream transition-colors"
        >
          &larr; Back to store
        </a>
      </motion.div>
    </div>
  )
}
