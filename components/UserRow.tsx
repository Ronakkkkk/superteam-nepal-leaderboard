'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Flame, ChevronDown } from 'lucide-react'
import type { Ambassador } from '@/components/LeaderboardTable'

/* ── Avatar URL helper ─────────────────────────────────────────── */
export function avatarUrl(username: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

/* ── Avatar component with silhouette fallback ─────────────────── */
function AvatarCircle({ username, size = 'md' }: { username: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8 sm:w-9 sm:h-9'
  return (
    <div className={`relative ${dim} rounded-full shrink-0`}
         style={{ background: 'rgba(255,255,255,0.06)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}>
      {/* Silhouette — always rendered, visible when img fails */}
      <div className="absolute inset-0 flex items-center justify-center rounded-full pointer-events-none">
        <svg viewBox="0 0 24 24" className="w-[60%] h-[60%] text-white/20" fill="currentColor" aria-hidden>
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl(username)}
        alt={username}
        className="absolute inset-0 w-full h-full rounded-full object-cover"
        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
      />
    </div>
  )
}

/* ── Skill colour palette ──────────────────────────────────────── */
const SKILL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Operations:  { bg: 'rgba(59,130,246,0.12)',  text: '#93C5FD', border: 'rgba(59,130,246,0.22)' },
  Strategy:    { bg: 'rgba(20,184,166,0.12)',  text: '#5EEAD4', border: 'rgba(20,184,166,0.22)' },
  Development: { bg: 'rgba(20,241,149,0.10)',  text: '#14F195', border: 'rgba(20,241,149,0.28)' },
  Design:      { bg: 'rgba(168,85,247,0.12)',  text: '#D8B4FE', border: 'rgba(168,85,247,0.22)' },
  Content:     { bg: 'rgba(234,179,8,0.10)',   text: '#FDE68A', border: 'rgba(234,179,8,0.22)'  },
  Marketing:   { bg: 'rgba(249,115,22,0.12)',  text: '#FED7AA', border: 'rgba(249,115,22,0.22)' },
  Community:   { bg: 'rgba(236,72,153,0.10)',  text: '#FBCFE8', border: 'rgba(236,72,153,0.22)' },
}

const RANK_GLOW: Record<number, string> = {
  1: 'rgba(255,215,0,0.06)',
  2: 'rgba(192,192,192,0.04)',
  3: 'rgba(205,127,50,0.05)',
}
const RANK_BORDER: Record<number, string> = {
  1: 'rgba(255,215,0,0.6)',
  2: 'rgba(200,200,200,0.30)',
  3: 'rgba(205,127,50,0.35)',
}
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

/* ── Rank-based text-shadow helpers ────────────────────────────── */
function xpGlowStyle(rank: number): React.CSSProperties {
  if (rank === 1) return { textShadow: '0 0 16px rgba(255,215,0,0.55)', color: 'rgba(255,220,50,0.95)' }
  if (rank === 2) return { textShadow: '0 0 14px rgba(192,192,192,0.45)', color: 'rgba(210,210,210,0.9)' }
  if (rank === 3) return { textShadow: '0 0 14px rgba(205,127,50,0.45)', color: 'rgba(205,140,70,0.95)' }
  if (rank <= 10) return { textShadow: '0 0 12px rgba(220,20,60,0.22)' }
  return {}
}

/* ── Skill badge ───────────────────────────────────────────────── */
function SkillBadge({ skill, idx }: { skill: string; idx: number }) {
  const c = SKILL_COLORS[skill] ?? {
    bg: 'rgba(255,255,255,0.06)',
    text: 'rgba(255,255,255,0.40)',
    border: 'rgba(255,255,255,0.10)',
  }
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22, delay: idx * 0.07 }}
      title={skill}
      className="inline-flex items-center px-2 py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {skill}
    </motion.span>
  )
}

/* ── XP breakdown card ─────────────────────────────────────────── */
function BreakdownCard({ category, xp }: { category: string; xp: number }) {
  const c = SKILL_COLORS[category] ?? {
    bg: 'rgba(255,255,255,0.06)',
    text: 'rgba(255,255,255,0.55)',
    border: 'rgba(255,255,255,0.10)',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-0.5 px-4 py-3 rounded-lg min-w-[130px]"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span className="text-[10px] uppercase tracking-widest font-sans text-white/40">{category}</span>
      <span className="font-mono font-bold text-sm" style={{ color: c.text }}>{xp.toLocaleString()} XP</span>
    </motion.div>
  )
}

/* ── Props ─────────────────────────────────────────────────────── */
export interface UserRowProps {
  ambassador: Ambassador
  rank: number
  index: number
  isCurrentUser: boolean
  isExpanded: boolean
  onToggle: (id: string) => void
  viewMode?: 'all_time' | 'this_week'
}

/* ── Component ─────────────────────────────────────────────────── */
export function UserRow({
  ambassador, rank, index, isCurrentUser, isExpanded, onToggle, viewMode = 'all_time',
}: UserRowProps) {
  const isTop3   = rank <= 3
  const isHot    = ambassador.weekly_xp > 100
  const trending = ambassador.weekly_xp > 0
  const isWeekly = viewMode === 'this_week'

  // Primary XP value changes based on view mode
  const primaryXp = isWeekly ? ambassador.weekly_xp : ambassador.total_xp

  /* XP breakdown — fetched lazily on expand */
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null)
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)

  useEffect(() => {
    if (!isExpanded || breakdown !== null) return
    setLoadingBreakdown(true)
    fetch(`/api/xp-breakdown?ambassador_id=${ambassador.id}`)
      .then(r => r.json())
      .then(json => setBreakdown(json.data ?? {}))
      .catch(() => setBreakdown({}))
      .finally(() => setLoadingBreakdown(false))
  }, [isExpanded, ambassador.id, breakdown])

  const rowBg = isCurrentUser
    ? 'rgba(20,241,149,0.03)'
    : isTop3 ? RANK_GLOW[rank] : 'transparent'

  const leftBorderColor = isCurrentUser
    ? '#14F195'
    : isTop3 ? RANK_BORDER[rank] : '#14F195'

  // Rank 1 username: gold gradient text
  const usernameStyle: React.CSSProperties = rank === 1
    ? {
        background: 'linear-gradient(90deg, #FFD700 0%, #FFF0A0 50%, #FFD700 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: 'none',
        filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.3))',
      }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative border-b border-white/[0.05]"
      style={{ background: rowBg }}
    >
      {/* Left border */}
      {(isTop3 || isCurrentUser) && (
        <div className="absolute left-0 inset-y-0 w-[2px]" style={{ background: leftBorderColor }} />
      )}
      {!isTop3 && !isCurrentUser && (
        <div className="absolute left-0 inset-y-0 w-[2px] bg-[#14F195] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
      )}

      {/* Main row */}
      <motion.div
        whileHover={{ y: -1, transition: { duration: 0.15 } }}
        onClick={() => onToggle(ambassador.id)}
        className="flex items-center gap-3 px-4 sm:px-6 py-3.5 cursor-pointer hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)] transition-shadow duration-200"
      >
        {/* Rank — 60px */}
        <div className="w-[60px] flex justify-center shrink-0 select-none">
          {isTop3 ? (
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.2 + rank * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              aria-label={`Rank ${rank}`}
              className="text-lg sm:text-xl"
            >
              {MEDAL[rank]}
            </motion.span>
          ) : (
            <span className="font-syne text-xs sm:text-sm font-bold text-white/20">#{rank}</span>
          )}
        </div>

        {/* Avatar + Username */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-[200px] min-w-0">
          <div className="relative shrink-0">
            <AvatarCircle username={ambassador.username} />
            {isCurrentUser && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#14F195] rounded-full ring-2 ring-[#0a0a0a]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans text-sm font-medium text-white/90 truncate" style={usernameStyle}>
                {ambassador.username}
              </span>
              {isCurrentUser && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#14F195] bg-[#14F195]/10 border border-[#14F195]/25 px-1.5 py-px rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-white/30 font-mono md:hidden mt-0.5">
              {primaryXp.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Primary XP — 120px */}
        <div className="hidden md:block w-[120px] text-right shrink-0">
          <span className="font-mono font-bold text-sm" style={{ color: 'rgba(255,255,255,0.85)', ...xpGlowStyle(rank) }}>
            {primaryXp.toLocaleString()}
          </span>
          <span className="text-[11px] text-white/25 font-sans ml-1">XP</span>
        </div>

        {/* This Month — 120px */}
        <div className="hidden md:block w-[120px] text-right shrink-0">
          <span className="font-mono text-sm text-white/45">
            {ambassador.monthly_xp > 0 ? `+${ambassador.monthly_xp.toLocaleString()}` : '—'}
          </span>
        </div>

        {/* This Week — 100px (hidden in weekly mode) */}
        {!isWeekly && (
          <div className="hidden md:flex items-center justify-end w-[100px] shrink-0">
            {isHot ? (
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#14F195] bg-[#14F195]/10 border border-[#14F195]/20 px-2 py-0.5 rounded-full font-mono"
              >
                <Flame className="w-3 h-3 text-[#14F195]" />
                +{ambassador.weekly_xp}
              </motion.span>
            ) : (
              <span className="font-mono text-sm text-white/30">
                {ambassador.weekly_xp > 0 ? `+${ambassador.weekly_xp}` : '—'}
              </span>
            )}
          </div>
        )}

        {/* Skills — flex-1 */}
        <div className="hidden lg:flex items-center gap-1.5 flex-1 flex-wrap pl-4">
          {(ambassador.skills ?? []).slice(0, 3).map((skill, i) => (
            <SkillBadge key={skill} skill={skill} idx={i} />
          ))}
          {(ambassador.skills ?? []).length > 3 && (
            <span className="text-[11px] text-white/25 font-sans">+{(ambassador.skills ?? []).length - 3}</span>
          )}
          {(ambassador.skills ?? []).length === 0 && (
            <span className="text-xs text-white/15 font-sans">—</span>
          )}
        </div>

        {/* Trend — 60px */}
        <div className="hidden md:flex items-center justify-center w-[60px] shrink-0">
          {trending ? (
            <TrendingUp className="w-4 h-4 text-[#14F195] opacity-70" />
          ) : (
            <TrendingDown className="w-4 h-4 text-white/20" />
          )}
        </div>

        {/* Chevron — 60px */}
        <div className="flex items-center justify-center w-[60px] shrink-0">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}>
            <ChevronDown className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded XP breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="breakdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.04]">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-sans mb-3">
                XP Breakdown by Category
              </p>
              {loadingBreakdown ? (
                <div className="flex gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-32 h-14 bg-white/[0.04] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : breakdown && Object.keys(breakdown).length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(breakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, xp]) => (
                      <BreakdownCard key={cat} category={cat} xp={xp} />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-white/20 font-sans">No XP transactions recorded yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
