'use client'

import { useState } from 'react'
import { Layers, ChevronRight, Plus } from 'lucide-react'
import ProgramModal from './ProgramModal'
import type { Program } from '@/app/actions/programs'

interface ProgramBannerProps {
  activeProgram: Program | null
  programs: Program[]
}

function getDayCount(startDate: string) {
  const from = new Date(startDate)
  const now = new Date()
  const days = Math.round((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  return days + 1
}

export default function ProgramBanner({ activeProgram, programs }: ProgramBannerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.7rem 1rem',
          marginBottom: '1rem',
          borderRadius: 'var(--radius-sm)',
          border: activeProgram
            ? '1px solid rgba(34,211,238,0.3)'
            : '1px dashed var(--border)',
          background: activeProgram
            ? 'linear-gradient(90deg, rgba(34,211,238,0.08) 0%, transparent 100%)'
            : 'var(--bg-card2)',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: activeProgram ? 'rgba(34,211,238,0.12)' : 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={15} style={{ color: activeProgram ? 'var(--accent)' : 'var(--text-dimmed)' }} />
          </div>
          <div>
            {activeProgram ? (
              <>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent)', lineHeight: 1.2 }}>
                  {activeProgram.name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                  Jour {getDayCount(activeProgram.start_date)} du programme
                </p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Aucun programme actif
                </p>
                <p style={{ color: 'var(--text-dimmed)', fontSize: '0.72rem', marginTop: '2px' }}>
                  Démarre une phase pour suivre ta progression
                </p>
              </>
            )}
          </div>
        </div>
        <div style={{ color: 'var(--text-dimmed)', display: 'flex', alignItems: 'center' }}>
          {activeProgram ? <ChevronRight size={16} /> : <Plus size={15} />}
        </div>
      </button>

      {open && (
        <ProgramModal
          activeProgram={activeProgram}
          programs={programs}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
