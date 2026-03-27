'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search…' }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.05] border border-white/[0.08]
                   focus:border-[#14F195]/40 focus:bg-white/[0.07]
                   rounded-lg pl-9 pr-3 py-2 text-sm
                   text-white/80 placeholder:text-white/25
                   outline-none transition-colors duration-200 font-sans"
      />
    </div>
  )
}
