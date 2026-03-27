'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Ambassador } from '@/components/LeaderboardTable'

interface AdminPanelProps {
  ambassadors: Ambassador[]
  onRefresh: () => void
}

export function AdminPanel({ ambassadors, onRefresh }: AdminPanelProps) {
  const [secret, setSecret] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [xpDelta, setXpDelta] = useState('')
  const [reason, setReason] = useState('')
  const [newName, setNewName] = useState('')
  const [newWallet, setNewWallet] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleXpUpdate() {
    if (!selectedId || !xpDelta || !secret) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ ambassador_id: selectedId, xp_delta: Number(xpDelta), reason }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStatus('XP updated successfully.')
      onRefresh()
    } catch (e: unknown) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAmbassador() {
    if (!newName || !secret) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/ambassadors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ name: newName, wallet_address: newWallet || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStatus(`Ambassador "${newName}" added.`)
      setNewName('')
      setNewWallet('')
      onRefresh()
    } catch (e: unknown) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!secret) return
    if (!confirm(`Delete ${name}?`)) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(`/api/ambassadors?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': secret },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStatus(`Ambassador deleted.`)
      onRefresh()
    } catch (e: unknown) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Auth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin Secret</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            placeholder="Enter admin secret key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Update XP */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update XP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select ambassador</option>
            {ambassadors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username} ({a.total_xp} XP)
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="XP delta (e.g. 50 or -10)"
            value={xpDelta}
            onChange={(e) => setXpDelta(e.target.value)}
          />
          <Input
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button onClick={handleXpUpdate} disabled={loading || !selectedId || !xpDelta || !secret}>
            Apply XP Change
          </Button>
        </CardContent>
      </Card>

      {/* Add Ambassador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Ambassador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Wallet address (optional)"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
          />
          <Button onClick={handleAddAmbassador} disabled={loading || !newName || !secret}>
            Add Ambassador
          </Button>
        </CardContent>
      </Card>

      {/* Ambassador List with Delete */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Ambassadors</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {ambassadors.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>
                  {a.username}{' '}
                  <span className="text-muted-foreground">({a.total_xp} XP)</span>
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading || !secret}
                  onClick={() => handleDelete(a.id, a.username)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Status */}
      {status && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm ${status.startsWith('Error') ? 'text-destructive' : 'text-green-600'}`}
        >
          {status}
        </motion.p>
      )}
    </motion.div>
  )
}
