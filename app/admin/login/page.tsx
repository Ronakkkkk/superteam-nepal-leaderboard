'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [pw, setPw]       = useState('')
  const [show, setShow]   = useState(false)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function attempt() {
    if (!pw.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (res.ok) {
        router.push('/admin')
      } else {
        setError(true)
        setShake(true)
        setTimeout(() => setShake(false), 600)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
             style={{ background: '#0d0d0d' }}>
          <div className="h-[2px] bg-[#DC143C]" />
          <div className="px-8 py-8">
            <div className="flex flex-col items-center mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/superteam-logo.png"
                alt="Superteam"
                className="h-10 w-auto object-contain mb-3"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <p className="font-archivo font-bold text-sm text-[#DC143C] tracking-wide"
                 style={{ fontStretch: 'semi-expanded' }}>
                Admin Panel
              </p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={pw}
                  onChange={e => { setPw(e.target.value); setError(false) }}
                  onKeyDown={e => e.key === 'Enter' && attempt()}
                  className={`w-full bg-white/[0.04] border rounded-lg px-3 py-2.5 pr-10 text-sm
                    text-white/80 placeholder:text-white/25 outline-none font-sans transition-colors
                    ${error ? 'border-[#DC143C]/50 focus:border-[#DC143C]/70' : 'border-white/[0.1] focus:border-[#DC143C]/40'}`}
                />
                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[12px] text-[#ff6b6b] font-sans"
                  >
                    Incorrect password
                  </motion.p>
                )}
              </AnimatePresence>
              <button
                onClick={attempt}
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold font-sans text-white transition-all duration-150
                           hover:shadow-[0_0_20px_rgba(220,20,60,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#b50f30,#DC143C)' }}
              >
                {loading ? 'Verifying…' : 'Enter Admin'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
