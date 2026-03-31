'use client'

import { useState } from 'react'
import EntryModal from '@/components/EntryModal'
import Fab from '@/components/Fab'
import ProgramModal from '@/components/ProgramModal'
import type { Entry } from '@/lib/types'
import type { Program } from '@/app/actions/programs'
import { Scale, Flame, Footprints, Layers, ChevronRight } from 'lucide-react'

const WORKOUT_BADGE_CLASS: Record<string, string> = {
  'Gym': 'badge-gym',
  'Cardio': 'badge-cardio',
  'Repos': 'badge-repos',
  'Gym + Cardio': 'badge-gymcardio',
}

const WORKOUT_EMOJI: Record<string, string> = {
  'Gym': '🏋️',
  'Cardio': '🏃',
  'Repos': '😴',
  'Gym + Cardio': '⚡',
}

function formatNum(n: number) {
  return n.toLocaleString('fr-FR')
}

interface HistoryClientProps {
  entries: Entry[]
  programs: Program[]
  activeProgram: Program | null
}

export default function HistoryClient({ entries, programs, activeProgram }: HistoryClientProps) {
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [addDate, setAddDate] = useState<string | null>(null)
  const [showProgramModal, setShowProgramModal] = useState(false)
  // null = toutes les entrées, string = program_id, 'none' = entrées sans programme
  const [filterProgramId, setFilterProgramId] = useState<string | null | 'none'>(
    activeProgram?.id ?? null
  )

  // Filtrer les entrées
  const filteredEntries = filterProgramId === null
    ? entries
    : filterProgramId === 'none'
      ? entries.filter(e => !e.program_id)
      : entries.filter(e => e.program_id === filterProgramId)

  return (
    <>
      {/* Filtre par programme */}
      {programs.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {/* Bouton gérer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dimmed)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Filtrer par phase
            </span>
            <button
              onClick={() => setShowProgramModal(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--accent)',
                fontSize: '0.75rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '3px', fontWeight: 600, padding: 0,
              }}
            >
              <Layers size={12} /> Gérer
            </button>
          </div>

          {/* Tabs de filtre */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {/* Tout */}
            <FilterTab
              label="Tout"
              active={filterProgramId === null}
              onClick={() => setFilterProgramId(null)}
            />
            {/* Un tab par programme */}
            {programs.map(p => (
              <FilterTab
                key={p.id}
                label={p.name}
                active={filterProgramId === p.id}
                isActive={p.is_active}
                onClick={() => setFilterProgramId(p.id)}
              />
            ))}
            {/* Entrées sans programme */}
            <FilterTab
              label="Sans phase"
              active={filterProgramId === 'none'}
              onClick={() => setFilterProgramId('none')}
              muted
            />
          </div>
        </div>
      )}

      {/* Stats du filtre actif */}
      {filterProgramId !== null && filteredEntries.length > 0 && (() => {
        const prog = programs.find(p => p.id === filterProgramId)
        const weights = filteredEntries.filter(e => e.weight).map(e => parseFloat(String(e.weight)))
        const firstWeight = weights[weights.length - 1]
        const lastWeight = weights[0]
        const delta = firstWeight && lastWeight ? parseFloat((lastWeight - firstWeight).toFixed(1)) : null
        return (
          <div className="card-sm" style={{ marginBottom: '1rem', background: 'rgba(34,211,238,0.04)', borderColor: 'rgba(34,211,238,0.2)' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
              {prog?.name ?? 'Phase'}
              {prog?.is_active && <span style={{ marginLeft: '6px', fontSize: '0.65rem', background: 'rgba(34,211,238,0.15)', padding: '1px 6px', borderRadius: '99px' }}>ACTIF</span>}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                📋 {filteredEntries.length} entrée{filteredEntries.length > 1 ? 's' : ''}
              </span>
              {firstWeight && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ⚖️ Départ : <strong style={{ color: 'var(--text)' }}>{firstWeight} kg</strong>
                </span>
              )}
              {lastWeight && firstWeight !== lastWeight && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  🎯 Actuel : <strong style={{ color: 'var(--text)' }}>{lastWeight} kg</strong>
                </span>
              )}
              {delta !== null && (
                <span style={{
                  fontSize: '0.78rem', fontWeight: 700,
                  color: delta < 0 ? 'var(--green)' : delta > 0 ? 'var(--red)' : 'var(--text-muted)',
                }}>
                  {delta > 0 ? '+' : ''}{delta} kg au total
                </span>
              )}
            </div>
          </div>
        )
      })()}

      {/* Liste des entrées */}
      {filteredEntries.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '0.75rem',
          color: 'var(--text-dimmed)', textAlign: 'center',
          paddingTop: '3rem',
        }}>
          <span style={{ fontSize: '3rem' }}>📭</span>
          <p>Aucune entrée dans cette phase</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredEntries.map(entry => {
            const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })
            return (
              <button
                key={entry.id}
                onClick={() => setEditEntry(entry)}
                className="card-sm"
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'border-color 0.2s, background 0.2s',
                  background: 'var(--bg-card2)',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{dateLabel}</p>
                  {entry.workout_type && (
                    <span className={`badge ${WORKOUT_BADGE_CLASS[entry.workout_type]}`} style={{ fontSize: '0.7rem' }}>
                      {WORKOUT_EMOJI[entry.workout_type]} {entry.workout_type}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {entry.weight !== null && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 600 }}>
                      <Scale size={13} /> {entry.weight} kg
                    </span>
                  )}
                  {entry.calories !== null && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fb923c', fontSize: '0.82rem', fontWeight: 600 }}>
                      <Flame size={13} /> {entry.calories} kcal
                    </span>
                  )}
                  {entry.steps !== null && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                      <Footprints size={13} /> {formatNum(entry.steps)} pas
                    </span>
                  )}
                </div>

                {entry.notes && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    &ldquo;{entry.notes}&rdquo;
                  </p>
                )}

                {entry.photo_url && (
                  <div style={{ marginTop: '0.6rem', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/7' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.photo_url} alt="Progress" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {editEntry && (
        <EntryModal
          existing={editEntry}
          onClose={() => setEditEntry(null)}
        />
      )}

      {addDate && (
        <EntryModal
          defaultDate={addDate}
          onClose={() => setAddDate(null)}
        />
      )}

      {showProgramModal && (
        <ProgramModal
          programs={programs}
          activeProgram={activeProgram}
          onClose={() => setShowProgramModal(false)}
        />
      )}

      <Fab />
    </>
  )
}

function FilterTab({
  label, active, isActive, onClick, muted,
}: {
  label: string
  active: boolean
  isActive?: boolean
  onClick: () => void
  muted?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '0.35rem 0.75rem',
        borderRadius: '99px',
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: active ? 'rgba(34,211,238,0.12)' : 'var(--bg-card2)',
        color: active ? 'var(--accent)' : muted ? 'var(--text-dimmed)' : 'var(--text-muted)',
        fontSize: '0.78rem',
        fontWeight: active ? 700 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />}
      {label}
    </button>
  )
}
