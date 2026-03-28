'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, Globe, MessageCircle } from 'lucide-react'
import { UserRow } from '@/components/UserRow'
import { ActivityFeed } from '@/components/ActivityFeed'
import confetti from 'canvas-confetti'

/* ── Types ─────────────────────────────────────────────────────── */
export interface Ambassador {
  id: string
  username: string
  avatar_url: string | null
  skills: string[] | null
  total_xp: number
  monthly_xp: number
  weekly_xp: number
}

type SortOption = 'total_xp_desc' | 'total_xp_asc' | 'monthly_xp_desc' | 'weekly_xp_desc' | 'name_asc'
type ViewMode   = 'all_time' | 'this_week'

const ITEMS_PER_PAGE = 15

const ALL_SKILLS = ['Development', 'Design', 'Marketing', 'Content', 'Community', 'Operations', 'Strategy'] as const

const CHIP_COLORS: Record<string, { inactive: string; activeBg: string; activeBorder: string; activeText: string }> = {
  Operations:  { inactive: 'rgba(255,255,255,0.06)', activeBg: 'rgba(59,130,246,0.18)',  activeBorder: 'rgba(59,130,246,0.45)',  activeText: '#93C5FD' },
  Strategy:    { inactive: 'rgba(255,255,255,0.06)', activeBg: 'rgba(20,184,166,0.18)',  activeBorder: 'rgba(20,184,166,0.45)',  activeText: '#5EEAD4' },
  Development: { inactive: 'rgba(255,255,255,0.06)', activeBg: 'rgba(20,241,149,0.15)',  activeBorder: 'rgba(20,241,149,0.45)',  activeText: '#14F195' },
  Design:      { inactive: 'rgba(255,255,255,0.06)', activeBg: 'rgba(168,85,247,0.18)',  activeBorder: 'rgba(168,85,247,0.45)',  activeText: '#D8B4FE' },
  Content:     { inactive: 'rgba(255,255,255,0.06)', activeBg: 'rgba(234,179,8,0.15)',   activeBorder: 'rgba(234,179,8,0.45)',   activeText: '#FDE68A' },
  Marketing:   { inactive: 'rgba(255,255,255,0.06)', activeBg: 'rgba(249,115,22,0.18)',  activeBorder: 'rgba(249,115,22,0.45)',  activeText: '#FED7AA' },
  Community:   { inactive: 'rgba(255,255,255,0.06)', activeBg: 'rgba(236,72,153,0.15)',  activeBorder: 'rgba(236,72,153,0.45)',  activeText: '#FBCFE8' },
}

/* ── Count-up hook ──────────────────────────────────────────────── */
function useCountUp(end: number, duration = 2000) {
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || end === 0) return
    started.current = true
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4)
      setVal(Math.round(eased * end))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [end, duration])

  return val
}

/* ── Himalayan mountain silhouette ──────────────────────────────── */
function HimalayanBg() {
  return (
    <svg className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
         viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M0 260 V232 L55 215 L112 198 L168 182 L222 166 L272 149 L318 132 L358 114 L393 97 L424 80 L448 64 L468 49 L483 36 L495 24 L504 15 L511 8 L517 3 L522 8 L527 3 L533 9 L540 18 L548 9 L556 1 L563 9 L571 20 L580 12 L590 4 L600 14 L611 28 L622 18 L633 10 L644 20 L655 34 L668 24 L681 38 L696 54 L714 44 L733 60 L755 75 L778 65 L803 80 L830 94 L860 86 L892 100 L928 113 L966 104 L1007 118 L1052 129 L1101 139 L1154 148 L1212 157 L1278 165 L1352 172 L1440 178 V260 Z"
        fill="#DC143C" fillOpacity={0.04} />
      <path d="M0 260 V245 L72 230 L148 214 L220 197 L286 179 L347 160 L402 141 L450 122 L492 103 L528 86 L558 70 L583 57 L603 46 L619 37 L631 30 L641 25 L649 21 L655 18 L660 22 L666 16 L672 21 L679 29 L688 20 L697 13 L707 22 L718 35 L730 25 L742 16 L754 27 L768 42 L783 32 L799 22 L815 34 L833 50 L853 40 L874 56 L898 70 L924 62 L952 78 L983 92 L1017 84 L1053 98 L1093 110 L1137 120 L1186 130 L1240 139 L1300 148 L1368 156 L1440 163 V260 Z"
        fill="#DC143C" fillOpacity={0.055} />
      <path d="M0 260 V252 L60 246 L130 239 L210 230 L302 220 L405 209 L518 197 L638 185 L760 172 L872 159 L972 146 L1060 133 L1138 121 L1206 110 L1265 100 L1315 91 L1358 83 L1392 76 L1420 70 L1438 66 L1440 66 V260 Z"
        fill="#DC143C" fillOpacity={0.07} />
    </svg>
  )
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const animated = useCountUp(value, 2000)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#DC143C] rounded-t-xl" />
      <p className="text-[10px] text-white/35 uppercase tracking-[0.18em] font-sans mb-1.5">
        {label}
      </p>
      <p className="font-mono font-bold text-2xl sm:text-3xl leading-none">
        <span className="text-white">{animated.toLocaleString()}</span>
        {suffix && <span className="text-white/35 text-base sm:text-lg font-normal ml-1.5">{suffix}</span>}
      </p>
    </motion.div>
  )
}

/* ── Skeleton row ───────────────────────────────────────────────── */
function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.25, 0.5, 0.25] }}
      transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.08 }}
      className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04]"
    >
      <div className="w-[60px] h-5 bg-white/[0.06] rounded-md" />
      <div className="w-9 h-9 bg-white/[0.06] rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="w-36 h-3.5 bg-white/[0.06] rounded" />
        <div className="w-20 h-2.5 bg-white/[0.04] rounded" />
      </div>
      <div className="hidden md:block w-[120px] h-4 bg-white/[0.06] rounded" />
      <div className="hidden md:block w-[120px] h-4 bg-white/[0.06] rounded" />
      <div className="hidden md:block w-[100px] h-4 bg-white/[0.06] rounded" />
      <div className="hidden lg:flex gap-2">
        <div className="w-20 h-5 bg-white/[0.06] rounded-full" />
        <div className="w-16 h-5 bg-white/[0.06] rounded-full" />
      </div>
      <div className="w-[60px] h-4 bg-white/[0.06] rounded" />
      <div className="w-[60px] h-4 bg-white/[0.06] rounded" />
    </motion.div>
  )
}

/* ── Column header ──────────────────────────────────────────────── */
const ColHead = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) => (
  <span className={`text-[10px] font-medium uppercase tracking-[0.14em] text-white/22 font-sans text-${align}`}>
    {children}
  </span>
)

/* ── Pagination ─────────────────────────────────────────────────── */
function Pagination({ page, totalPages, total, filtered: filteredCount, onChange }: {
  page: number; totalPages: number; total: number; filtered: number; onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const start = (page - 1) * ITEMS_PER_PAGE + 1
  const end   = Math.min(page * ITEMS_PER_PAGE, filteredCount)

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  const btn = 'inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-sans transition-colors duration-150'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8">
      <p className="text-center text-[11px] text-white/25 font-sans mb-3">
        Showing {start}–{end} of {filteredCount} ambassador{filteredCount !== 1 ? 's' : ''}
        {filteredCount < total ? ` (filtered from ${total})` : ''}
      </p>
      <div className="flex items-center justify-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className={`${btn} text-white/40 hover:text-white/80 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e-${i}`} className="text-white/20 text-sm px-1">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p)}
              className={`${btn} ${p === page ? 'bg-[#DC143C] text-white font-semibold' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.06]'}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className={`${btn} text-white/40 hover:text-white/80 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed`}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

/* ── View mode toggle ────────────────────────────────────────────── */
function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center h-8 px-1 rounded-full bg-white/5 border border-white/10">
      {(['all_time', 'this_week'] as ViewMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`relative px-3 h-full rounded-full text-xs font-medium font-sans transition-colors duration-200 ${
            mode === m ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          {mode === m && (
            <motion.div
              layoutId="view-pill"
              className="absolute inset-0 rounded-full"
              style={{ background: '#DC143C' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{m === 'all_time' ? 'All Time' : 'This Week'}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
export function LeaderboardTable({ initialData }: { initialData: Ambassador[] }) {
  const [data, setData]                     = useState<Ambassador[]>(initialData)
  const [search, setSearch]                 = useState('')
  const [searchFocused, setSearchFocused]   = useState(false)
  const [sortKey, setSortKey]               = useState<SortOption>('total_xp_desc')
  const [viewMode, setViewMode]             = useState<ViewMode>('all_time')
  const [page, setPage]                     = useState(1)
  const [expandedId, setExpandedId]         = useState<string | null>(null)
  const [currentUser, setCurrentUser]       = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing]     = useState(false)
  const [hasLoaded, setHasLoaded]           = useState(initialData.length > 0)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const searchRef     = useRef<HTMLInputElement>(null)
  const tableRef      = useRef<HTMLDivElement>(null)
  const confettiFired = useRef(false)

  useEffect(() => { setCurrentUser(localStorage.getItem('currentUser')) }, [])

  /* Confetti on first load — once per session only */
  useEffect(() => {
    if (!hasLoaded || confettiFired.current || data.length === 0) return
    if (sessionStorage.getItem('confetti_fired')) return
    confettiFired.current = true
    sessionStorage.setItem('confetti_fired', '1')
    confetti({ particleCount: 80, spread: 60, colors: ['#DC143C', '#FFD700', '#FFFFFF'], origin: { x: 0.5, y: 0.45 } })
  }, [hasLoaded, data.length])

  /* ⌘K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* Auto-refresh */
  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' })
      if (res.ok) { const { data: fresh } = await res.json(); setData(fresh ?? []); setHasLoaded(true) }
    } finally { setIsRefreshing(false) }
  }, [])

  useEffect(() => {
    if (!hasLoaded) refresh()
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh, hasLoaded])

  /* Reset page on filter/mode/sort change */
  useEffect(() => { setPage(1) }, [search, sortKey, selectedSkills, viewMode])

  /* Sort — weekly mode always sorts by weekly_xp desc */
  const sorted = useMemo(() => {
    if (viewMode === 'this_week') return [...data].sort((a, b) => b.weekly_xp - a.weekly_xp)
    return [...data].sort((a, b) => {
      switch (sortKey) {
        case 'total_xp_desc':   return b.total_xp - a.total_xp
        case 'total_xp_asc':    return a.total_xp - b.total_xp
        case 'monthly_xp_desc': return b.monthly_xp - a.monthly_xp
        case 'weekly_xp_desc':  return b.weekly_xp - a.weekly_xp
        case 'name_asc':        return a.username.localeCompare(b.username)
        default:                return b.total_xp - a.total_xp
      }
    })
  }, [data, sortKey, viewMode])

  const filtered = useMemo(() => {
    return sorted.filter(a => {
      const matchesSearch = a.username.toLowerCase().includes(search.toLowerCase())
      const matchesSkill  = selectedSkills.length === 0 || selectedSkills.some(s => (a.skills ?? []).includes(s))
      return matchesSearch && matchesSkill
    })
  }, [sorted, search, selectedSkills])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  /* Stat card values change with viewMode */
  const statValue = viewMode === 'this_week'
    ? data.reduce((s, a) => s + a.weekly_xp, 0)
    : data.reduce((s, a) => s + a.total_xp,  0)
  const statLabel = viewMode === 'this_week' ? 'XP This Week' : 'Total XP Earned'

  /* Stable ranks — always by total_xp desc */
  const rankMap = useMemo(() => {
    const m: Record<string, number> = {}
    ;[...data].sort((a, b) => b.total_xp - a.total_xp).forEach((a, i) => { m[a.id] = i + 1 })
    return m
  }, [data])

  const handleToggle = (id: string) => setExpandedId(prev => prev === id ? null : id)

  const handlePageChange = (p: number) => {
    setPage(p)
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-xl"
        style={{ borderBottom: '1px solid rgba(220,20,60,0.18)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/superteam-logo.png" alt="Superteam" className="h-8 w-auto object-contain"
              onError={e => {
                const img = e.currentTarget as HTMLImageElement
                img.style.display = 'none'
                const fb = img.nextElementSibling as HTMLElement | null
                if (fb) fb.style.display = 'flex'
              }} />
            <span className="hidden w-8 h-8 items-center justify-center rounded-lg font-syne font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg,rgba(220,20,60,0.3),rgba(220,20,60,0.08))', boxShadow: '0 0 0 1px rgba(220,20,60,0.25)' }}>
              ST
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <AnimatePresence>
              {isRefreshing && (
                <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }} transition={{ opacity: { duration: 1.2, repeat: Infinity } }}
                  className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
              )}
            </AnimatePresence>
            <a href="https://earn.superteam.fun/bounties/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-white text-[13px] font-semibold font-sans transition-all duration-200 whitespace-nowrap hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_16px_rgba(220,20,60,0.35)] hover:shadow-[0_0_28px_rgba(220,20,60,0.6)]"
              style={{ background: 'linear-gradient(135deg,#b50f30 0%,#DC143C 60%,#e8294f 100%)' }}>
              Claim XP
            </a>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(220,20,60,0.05),transparent)]" />
        <HimalayanBg />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}>

            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="font-sans text-[10px] font-medium text-white/30 uppercase tracking-[0.22em]">Superteam Nepal</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-[#DC143C] border border-[#DC143C]/25"
                style={{ background: 'rgba(220,20,60,0.08)' }}>Season 2026</span>
            </motion.div>

            <motion.h1 variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              className="font-archivo font-extrabold text-[2.6rem] sm:text-6xl md:text-7xl leading-[1.02] tracking-[-0.01em] mb-4"
              style={{ fontStretch: 'semi-expanded' }}>
              Ambassador<br />
              <span className="gradient-text-crimson">Leaderboard</span>
            </motion.h1>

            <motion.p variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="font-sans text-sm sm:text-[15px] text-white/42 mb-8 max-w-[600px] leading-relaxed">
              In our community, being able to know who to trust and who has proven shipping
              abilities is essential. Our (work-in-progress) Reputation System captures
              Ambassadors&apos; contributions and gives them XP so that Project Leads know
              which Ambassadors are reliable.
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-wrap gap-3">
              <StatCard label={statLabel} value={statValue} suffix="XP" />
              <StatCard label="Active Ambassadors" value={data.length} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <main className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 pb-8">

        {/* Row 1: Search + Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 sm:px-0 mt-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input ref={searchRef} value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search ambassadors…"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#DC143C]/40 focus:bg-white/[0.06] rounded-lg pl-8 pr-12 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none transition-colors duration-200 font-sans"
            />
            <AnimatePresence>
              {!searchFocused && !search && (
                <motion.kbd initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-[10px] font-sans text-white/18 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] pointer-events-none">
                  ⌘K
                </motion.kbd>
              )}
            </AnimatePresence>
          </div>

          {/* Sort (hidden in weekly mode since sort is fixed) */}
          {viewMode === 'all_time' && (
            <div className="relative shrink-0">
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortOption)}
                className="appearance-none bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-lg px-4 py-2 pr-8 text-sm text-white/60 font-sans outline-none cursor-pointer transition-colors duration-150">
                <option value="total_xp_desc">Sort: Total XP (High → Low)</option>
                <option value="total_xp_asc">Sort: Total XP (Low → High)</option>
                <option value="monthly_xp_desc">Sort: This Month (High → Low)</option>
                <option value="weekly_xp_desc">Sort: This Week (High → Low)</option>
                <option value="name_asc">Sort: Name (A → Z)</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Filter chips row + toggle (same row, toggle right-aligned) */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 px-4 sm:px-0 mt-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setSelectedSkills([])}
              className="px-3 py-1 rounded-full text-[11px] font-medium font-sans transition-all duration-150 border"
              style={selectedSkills.length === 0
                ? { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
              All
            </motion.button>
            {ALL_SKILLS.map(skill => {
              const c = CHIP_COLORS[skill]; const active = selectedSkills.includes(skill)
              return (
                <motion.button key={skill} whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  onClick={() => toggleSkill(skill)}
                  className="px-3 py-1 rounded-full text-[11px] font-medium font-sans transition-all duration-150 border"
                  style={active
                    ? { background: c.activeBg, borderColor: c.activeBorder, color: c.activeText }
                    : { background: c.inactive, borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                  {skill}
                </motion.button>
              )
            })}
          </div>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>

        <div className="border-t border-white/[0.06] mt-4" />

        {/* Table card */}
        <div ref={tableRef} className="mt-4 rounded-xl overflow-hidden scroll-mt-24"
          style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Column headers */}
          <div className="hidden md:flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-white/[0.025]">
            <div className="w-[60px] flex justify-center"><ColHead align="center">#</ColHead></div>
            <div className="flex-1 min-w-[200px]"><ColHead>Ambassador</ColHead></div>
            <div className="w-[120px] text-right">
              <AnimatePresence mode="wait">
                <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <ColHead align="right">{viewMode === 'this_week' ? 'XP This Week' : 'Total XP'}</ColHead>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="w-[120px] text-right"><ColHead align="right">This Month</ColHead></div>
            {viewMode === 'all_time' && (
              <div className="w-[100px] text-right"><ColHead align="right">This Week</ColHead></div>
            )}
            <div className="flex-1 hidden lg:block pl-4"><ColHead>Skills</ColHead></div>
            <div className="w-[60px] flex justify-center"><ColHead align="center">Trend</ColHead></div>
            <div className="w-[60px]" />
          </div>

          {/* Rows */}
          {!hasLoaded ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} index={i} />)
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-3">
              <Search className="w-10 h-10 text-white/10" />
              <p className="font-sans text-sm text-white/25">No ambassadors found</p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {paginated.map((ambassador, index) => (
                <UserRow
                  key={ambassador.id}
                  ambassador={ambassador}
                  rank={rankMap[ambassador.id] ?? index + 1}
                  index={index}
                  isCurrentUser={currentUser === ambassador.username}
                  isExpanded={expandedId === ambassador.id}
                  onToggle={handleToggle}
                  viewMode={viewMode}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {hasLoaded && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} total={data.length}
            filtered={filtered.length} onChange={handlePageChange} />
        )}

        {/* Footer note */}
        {hasLoaded && data.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-center text-white/12 text-[11px] font-sans mt-4">
            auto-refreshes every 30 s
          </motion.p>
        )}

        {/* Activity Feed */}
        <div className="mt-10 max-w-2xl mx-auto px-4 sm:px-0">
          <ActivityFeed />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#111111] border-t border-white/[0.06] py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/superteam-logo.png" alt="Superteam Nepal" className="h-7 w-auto object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
          <p className="text-white/22 text-[12px] font-sans text-center order-last sm:order-none">
            © 2026 Superteam Nepal · Building Nepal&apos;s Web3 future.
          </p>
          <div className="flex items-center gap-5">
            <a href="https://twitter.com/SuperteamNepal" target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors duration-150" aria-label="Twitter / X">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
            </a>
            <a href="https://discord.gg/superteam" target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors duration-150" aria-label="Discord">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="https://superteam.fun" target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors duration-150" aria-label="Website">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
