'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FeedItem {
  id: string
  username: string
  amount: number
  category: string
  reason: string
  created_at: string
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Bounty':             '🏆',
  'Indie Contribution': '💡',
  'Superteam Task':     '⚡',
  'Grant Project':      '🤝',
  'IRL Event':          '🎪',
  'Workshop':           '🎓',
  'Content':            '✍️',
  'Braintrust':         '🧠',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 10)  return 'just now'
  if (s < 60)  return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

// Ladder depth: opacity and scale decrease with each card
const DEPTH = [
  { opacity: 1,    scale: 1,    shadow: '0 4px 24px rgba(0,0,0,0.4)' },
  { opacity: 0.85, scale: 0.97, shadow: undefined },
  { opacity: 0.7,  scale: 0.94, shadow: undefined },
  { opacity: 0.55, scale: 0.91, shadow: undefined },
  { opacity: 0.4,  scale: 0.88, shadow: undefined },
] as const

function xpColor(amount: number): string {
  if (amount >= 500) return '#FFD700'
  if (amount >= 200) return '#14F195'
  return 'rgba(255,255,255,0.85)'
}

export function ActivityFeed() {
  const [items, setItems]     = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useRef(false)

  async function fetchFeed() {
    try {
      const res = await fetch('/api/transactions?limit=20')
      if (!res.ok) return
      const json = await res.json()
      setItems((json.data ?? []).slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    mounted.current = true
    fetchFeed()
    const id = setInterval(fetchFeed, 30_000)
    return () => { mounted.current = false; clearInterval(id) }
  }, [])

  return (
    <div className="max-w-xl">
      {/* Shimmer keyframe for top emoji */}
      <style>{`
        @keyframes feed-shimmer {
          0%, 100% { filter: brightness(1); }
          50%       { filter: brightness(1.4); }
        }
        .feed-top-emoji { animation: feed-shimmer 2s ease-in-out infinite; }
        .feed-lightning  {
          color: #facc15;
          filter: drop-shadow(0 0 6px rgba(250,204,21,0.4));
        }
      `}</style>

      {/* Title row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <span className="text-sm font-medium text-white/80 font-sans">Live Activity</span>
        <span className="text-xs text-white/30 font-sans">· updates every 30s</span>
      </div>

      {/* Cards */}
      <div className="relative">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl bg-[#111111] border border-white/[0.06] border-l-2 border-l-white/10 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-28 h-3 bg-white/[0.06] rounded animate-pulse" />
                  <div className="w-20 h-2.5 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="w-16 h-3 bg-white/[0.06] rounded animate-pulse" />
                  <div className="w-10 h-2.5 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-white/25 font-sans py-4">No activity yet.</p>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const depth       = DEPTH[i] ?? DEPTH[DEPTH.length - 1]
              const emoji       = CATEGORY_EMOJI[item.category] ?? '⚡'
              const isLightning = emoji === '⚡'
              const isPositive  = item.amount >= 0
              const sign        = isPositive ? '+' : ''
              const color       = xpColor(item.amount)
              const accentColor = isPositive ? '#4ade80' : '#f87171'
              const isTop       = i === 0

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: depth.opacity, y: 0, scale: depth.scale }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="rounded-xl border px-4 py-3 flex items-center mb-2 transition-colors duration-200 cursor-default hover:bg-white/[0.1]"
                  style={{
                    background:      isTop ? 'rgba(255,255,255,0.08)' : '#111111',
                    borderColor:     'rgba(255,255,255,0.06)',
                    borderLeftColor: accentColor,
                    borderLeftWidth: '2px',
                    boxShadow:       depth.shadow ?? (isTop ? '0 4px 24px rgba(0,0,0,0.45)' : undefined),
                    zIndex:          5 - i,
                  }}
                >
                  {/* Emoji box */}
                  <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0${isTop ? ' feed-top-emoji' : ''}`}>
                    <span className={isLightning ? 'feed-lightning' : undefined}>{emoji}</span>
                  </div>

                  {/* Middle */}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate font-sans">{item.username}</p>
                    <p className="text-white/40 text-xs font-sans mt-0.5">{item.category}</p>
                  </div>

                  {/* Right */}
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-medium text-sm font-mono" style={{ color }}>
                      {sign}{item.amount} XP
                    </p>
                    <p className="text-white/30 text-xs font-sans mt-0.5">{timeAgo(item.created_at)}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        {/* Bottom fade */}
        {items.length > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0a0a0a)' }}
          />
        )}
      </div>
    </div>
  )
}
