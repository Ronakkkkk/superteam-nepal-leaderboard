'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Trash2, Plus, Award, Users, Clock, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { avatarUrl } from '@/components/UserRow'

/* ── Types ─────────────────────────────────────────────────────── */
interface Ambassador {
  id: string
  username: string
  avatar_url: string | null
  skills: string[] | null
  total_xp: number
  monthly_xp: number
  weekly_xp: number
  rank?: number
}

interface Transaction {
  id: string
  ambassador_id: string
  username: string
  amount: number
  category: string
  reason: string
  awarded_by: string
  created_at: string
}

const CATEGORIES = [
  'Bounty',
  'Indie Contribution',
  'Superteam Task',
  'Grant Project',
  'IRL Event',
  'Workshop',
  'Content',
  'Braintrust',
] as const

const ALL_SKILLS = ['Development', 'Design', 'Marketing', 'Content', 'Community', 'Operations', 'Strategy'] as const

/* ── Relative time helper ───────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60)   return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

/* ── Toast ──────────────────────────────────────────────────────── */
interface ToastItem { id: number; message: string; type: 'success' | 'error' }

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.92 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-sans shadow-xl"
            style={{
              background: t.type === 'success' ? 'rgba(20,241,149,0.12)' : 'rgba(220,20,60,0.12)',
              border: `1px solid ${t.type === 'success' ? 'rgba(20,241,149,0.3)' : 'rgba(220,20,60,0.3)'}`,
              color: t.type === 'success' ? '#14F195' : '#ff6b6b',
              maxWidth: '340px',
            }}
          >
            {t.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <XCircle className="w-4 h-4 shrink-0" />}
            <span className="text-white/90">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)
  const show = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800)
  }, [])
  const remove = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  return { toasts, show, remove }
}

/* ── Section card wrapper ───────────────────────────────────────── */
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.06] overflow-hidden"
      style={{ background: '#0d0d0d' }}
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2.5"
           style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ background: 'rgba(220,20,60,0.12)', border: '1px solid rgba(220,20,60,0.2)' }}>
          <Icon className="w-3.5 h-3.5 text-[#DC143C]" />
        </div>
        <h2 className="font-archivo font-bold text-base text-white/90"
            style={{ fontStretch: 'semi-expanded' }}>
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  )
}

/* ── Field helpers ──────────────────────────────────────────────── */
const inputCls = `w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm
  text-white/80 placeholder:text-white/25 outline-none font-sans
  focus:border-[#DC143C]/40 focus:bg-white/[0.06] transition-colors duration-150`

const selectCls = `w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm
  text-white/80 outline-none font-sans cursor-pointer appearance-none
  focus:border-[#DC143C]/40 transition-colors duration-150`

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-white/35 font-sans mb-1.5">{children}</label>
}

function SubmitBtn({ loading, disabled, children, onClick, variant = 'primary' }: {
  loading?: boolean; disabled?: boolean; children: React.ReactNode; onClick: () => void; variant?: 'primary' | 'danger'
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold font-sans
                 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style={variant === 'primary'
        ? { background: 'linear-gradient(135deg,#b50f30,#DC143C)', color: '#fff', boxShadow: loading ? 'none' : '0 0 16px rgba(220,20,60,0.3)' }
        : { background: 'rgba(220,20,60,0.1)', color: '#ff6b6b', border: '1px solid rgba(220,20,60,0.25)' }}
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ) : null}
      {children}
    </motion.button>
  )
}

/* ── Edit ambassador modal ──────────────────────────────────────── */
function EditModal({ ambassador, onSave, onCancel, toast }: {
  ambassador: Ambassador
  onSave: () => void
  onCancel: () => void
  toast: (msg: string, type: 'success' | 'error') => void
}) {
  const [username, setUsername]   = useState(ambassador.username)
  const [avatarUrlVal, setAvatarUrlVal] = useState(ambassador.avatar_url ?? '')
  const [skills, setSkills]       = useState<string[]>(ambassador.skills ?? [])
  const [loading, setLoading]     = useState(false)

  function toggleSkill(skill: string) {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  async function submit() {
    if (!username.trim()) return
    setLoading(true)
    try {
      const updates: Record<string, unknown> = { ambassador_id: ambassador.id }
      if (username.trim() !== ambassador.username) updates.username = username.trim()
      updates.avatar_url = avatarUrlVal.trim() || null
      updates.skills = skills
      const res = await fetch('/api/ambassadors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast(`Updated ${username.trim()}`, 'success')
      onSave()
    } catch (e) {
      toast(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="rounded-xl border border-white/[0.08] w-[420px] max-h-[90vh] overflow-y-auto"
          style={{ background: '#111' }}
        >
          {/* Modal header */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="font-archivo font-bold text-sm text-white/90" style={{ fontStretch: 'semi-expanded' }}>
              Edit Ambassador
            </h3>
            <button onClick={onCancel} className="text-white/30 hover:text-white/70 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-3 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl(username || ambassador.username)}
                alt={username}
                className="w-10 h-10 rounded-full bg-white/[0.04]"
              />
              <div>
                <p className="text-xs text-white/40 font-sans">Auto-generated avatar preview</p>
                <p className="text-[11px] text-white/20 font-sans">Updates with username</p>
              </div>
            </div>

            <div>
              <Label>Username</Label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className={inputCls} placeholder="e.g. bipin_xbt" />
            </div>

            <div>
              <Label>Avatar URL (optional override)</Label>
              <input type="text" value={avatarUrlVal} onChange={e => setAvatarUrlVal(e.target.value)}
                className={inputCls} placeholder="Leave blank for auto-generated" />
            </div>

            <div>
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_SKILLS.map(skill => {
                  const active = skills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="px-3 py-1 rounded-full text-[11px] font-medium font-sans border transition-all duration-150"
                      style={active
                        ? { background: 'rgba(220,20,60,0.12)', borderColor: 'rgba(220,20,60,0.35)', color: '#ff8095' }
                        : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                    >
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={onCancel}
                className="px-4 py-1.5 rounded-lg text-sm font-sans text-white/50 hover:text-white/80 bg-white/[0.04] border border-white/[0.08] transition-colors">
                Cancel
              </button>
              <SubmitBtn loading={loading} disabled={!username.trim()} onClick={submit}>
                Save Changes
              </SubmitBtn>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Confirm delete dialog ──────────────────────────────────────── */
function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="rounded-xl border border-white/[0.08] p-6 w-[340px]"
          style={{ background: '#111' }}
        >
          <p className="text-white/80 font-sans text-sm mb-1">Delete ambassador?</p>
          <p className="text-white/40 font-sans text-xs mb-5">
            This will permanently delete <span className="text-white/70 font-medium">{name}</span> and all their XP transactions.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel}
              className="px-4 py-1.5 rounded-lg text-sm font-sans text-white/50 hover:text-white/80 bg-white/[0.04] border border-white/[0.08] transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="px-4 py-1.5 rounded-lg text-sm font-sans font-semibold text-white bg-[#DC143C] hover:bg-[#b50f30] transition-colors">
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter()
  const [ambassadors, setAmbassadors]   = useState<Ambassador[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Ambassador | null>(null)
  const [editTarget, setEditTarget]     = useState<Ambassador | null>(null)
  const { toasts, show: toast, remove: removeToast } = useToast()

  const fetchAll = useCallback(async () => {
    const [ambRes, txRes] = await Promise.all([
      fetch('/api/leaderboard'),
      fetch('/api/transactions'),
    ])
    if (ambRes.ok)  setAmbassadors((await ambRes.json()).data ?? [])
    if (txRes.ok)   setTransactions((await txRes.json()).data ?? [])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {editTarget && (
        <EditModal
          ambassador={editTarget}
          toast={toast}
          onCancel={() => setEditTarget(null)}
          onSave={() => { setEditTarget(null); fetchAll() }}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.username}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            const target = deleteTarget
            setDeleteTarget(null)
            const res = await fetch('/api/ambassadors', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ambassador_id: target.id }),
            })
            const json = await res.json()
            if (!res.ok) { toast(`Delete failed: ${json.error}`, 'error'); return }
            toast(`Deleted ${target.username}`, 'success')
            fetchAll()
          }}
        />
      )}

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl"
           style={{ borderBottom: '1px solid rgba(220,20,60,0.15)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/"
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm font-sans">
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Link>
          <div className="h-4 w-px bg-white/[0.1]" />
          <span className="font-archivo font-bold text-sm text-white/60"
                style={{ fontStretch: 'semi-expanded' }}>
            Admin Panel
          </span>
          <div className="ml-auto">
            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' })
                router.push('/admin/login')
              }}
              className="text-[11px] font-sans text-white/25 hover:text-white/60 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ══ SECTION 1: Award XP ══════════════════════════════ */}
        <AwardXpSection ambassadors={ambassadors} onSuccess={() => { toast('', 'success'); fetchAll() }} toast={toast} />

        {/* ══ SECTION 2: Add Ambassador ════════════════════════ */}
        <AddAmbassadorSection onSuccess={() => fetchAll()} toast={toast} />

        {/* ══ SECTION 3: Manage Ambassadors ═══════════════════ */}
        <Section title="Manage Ambassadors" icon={Users}>
          {ambassadors.length === 0 ? (
            <p className="text-white/25 text-sm font-sans">No ambassadors yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Rank', 'Avatar', 'Username', 'Total XP', 'Skills', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-[0.12em] text-white/30 pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ambassadors.map(a => (
                    <tr key={a.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-white/30 font-mono text-xs">#{a.rank ?? '—'}</td>
                      <td className="py-3 pr-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarUrl(a.username)}
                          alt={a.username}
                          className="w-7 h-7 rounded-full bg-white/[0.04]"
                        />
                      </td>
                      <td className="py-3 pr-4 text-white/80 font-medium">{a.username}</td>
                      <td className="py-3 pr-4 font-mono text-white/60">{a.total_xp.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {(a.skills ?? []).slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]">{s}</span>
                          ))}
                          {(a.skills ?? []).length > 3 && (
                            <span className="text-[10px] text-white/25">+{(a.skills ?? []).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditTarget(a)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/50
                                       bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.08] hover:text-white/80 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(a)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#ff6b6b]
                                       bg-[#DC143C]/8 border border-[#DC143C]/15 hover:bg-[#DC143C]/15 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ══ SECTION 4: Recent Transactions ══════════════════ */}
        <Section title="Recent Transactions" icon={Clock}>
          {transactions.length === 0 ? (
            <p className="text-white/25 text-sm font-sans">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Ambassador', 'Amount', 'Category', 'Reason', 'Awarded By', 'Time'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-[0.12em] text-white/30 pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-white/80 font-medium whitespace-nowrap">{tx.username}</td>
                      <td className="py-3 pr-4 font-mono font-bold whitespace-nowrap"
                          style={{ color: tx.amount >= 0 ? '#14F195' : '#ff6b6b' }}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="py-3 pr-4 text-white/50 whitespace-nowrap">{tx.category}</td>
                      <td className="py-3 pr-4 text-white/40 max-w-[180px] truncate" title={tx.reason}>{tx.reason}</td>
                      <td className="py-3 pr-4 text-white/40 whitespace-nowrap">{tx.awarded_by}</td>
                      <td className="py-3 text-white/25 text-xs whitespace-nowrap">{timeAgo(tx.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

/* ── Award XP section (extracted for cleanliness) ──────────────── */
function AwardXpSection({ ambassadors, onSuccess, toast }: {
  ambassadors: Ambassador[]
  onSuccess: () => void
  toast: (msg: string, type: 'success' | 'error') => void
}) {
  const [selectedId, setSelectedId]   = useState('')
  const [amount, setAmount]           = useState('')
  const [category, setCategory]       = useState('')
  const [reason, setReason]           = useState('')
  const [awardedBy, setAwardedBy]     = useState('')
  const [loading, setLoading]         = useState(false)

  async function submit() {
    if (!selectedId || !amount || !category || !reason || !awardedBy) return
    setLoading(true)
    try {
      const res = await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambassador_id: selectedId,
          amount: Number(amount),
          reason,
          category,
          awarded_by: awardedBy,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const amb = ambassadors.find(a => a.id === selectedId)
      const sign = Number(amount) >= 0 ? '+' : ''
      toast(`${sign}${amount} XP awarded to ${amb?.username ?? 'ambassador'}`, 'success')
      setSelectedId(''); setAmount(''); setCategory(''); setReason(''); setAwardedBy('')
      onSuccess()
    } catch (e) {
      toast(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="Award XP" icon={Award}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ambassador */}
        <div>
          <Label>Ambassador</Label>
          <div className="relative">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={selectCls}>
              <option value="">Select ambassador…</option>
              {ambassadors.map(a => (
                <option key={a.id} value={a.id}>{a.username} — {a.total_xp.toLocaleString()} XP</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <Label>Category</Label>
          <div className="relative">
            <select value={category} onChange={e => setCategory(e.target.value)} className={selectCls}>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div>
          <Label>XP Amount (use negative to deduct)</Label>
          <input
            type="number"
            placeholder="e.g. 500 or -100"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Awarded By */}
        <div>
          <Label>Awarded By</Label>
          <input
            type="text"
            placeholder="Your name or handle"
            value={awardedBy}
            onChange={e => setAwardedBy(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Reason — full width */}
        <div className="sm:col-span-2">
          <Label>Reason / Description</Label>
          <input
            type="text"
            placeholder="e.g. Completed design bounty for XYZ project"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-5">
        <SubmitBtn
          loading={loading}
          disabled={!selectedId || !amount || !category || !reason || !awardedBy}
          onClick={submit}
        >
          Award XP
        </SubmitBtn>
      </div>
    </Section>
  )
}

/* ── Add Ambassador section ─────────────────────────────────────── */
function AddAmbassadorSection({ onSuccess, toast }: {
  onSuccess: () => void
  toast: (msg: string, type: 'success' | 'error') => void
}) {
  const [username, setUsername]     = useState('')
  const [avatarUrl, setAvatarUrl]   = useState('')
  const [skills, setSkills]         = useState<string[]>([])
  const [loading, setLoading]       = useState(false)

  function toggleSkill(skill: string) {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  async function submit() {
    if (!username.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/ambassadors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), avatar_url: avatarUrl.trim() || null, skills }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast(`Ambassador "${username.trim()}" added`, 'success')
      setUsername(''); setAvatarUrl(''); setSkills([])
      onSuccess()
    } catch (e) {
      toast(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="Add Ambassador" icon={Plus}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Username</Label>
          <input type="text" placeholder="e.g. bipin_xbt" value={username}
            onChange={e => setUsername(e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label>Avatar URL (optional)</Label>
          <input type="text" placeholder="Leave blank for auto-generated" value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {ALL_SKILLS.map(skill => {
              const active = skills.includes(skill)
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="px-3 py-1 rounded-full text-[11px] font-medium font-sans border transition-all duration-150"
                  style={active
                    ? { background: 'rgba(220,20,60,0.12)', borderColor: 'rgba(220,20,60,0.35)', color: '#ff8095' }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                >
                  {skill}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="mt-5">
        <SubmitBtn loading={loading} disabled={!username.trim()} onClick={submit}>
          Add Ambassador
        </SubmitBtn>
      </div>
    </Section>
  )
}
