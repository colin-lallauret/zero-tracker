'use client'

import { useState } from 'react'
import EntryModal from '@/components/EntryModal'
import Fab from '@/components/Fab'
import ProgramModal from '@/components/ProgramModal'
import PhotoGalleryModal from '@/components/PhotoGalleryModal'
import type { Program } from '@/app/actions/programs'
import type { Entry } from '@/lib/types'
import { Layers, Image as ImageIcon } from 'lucide-react'

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
  const [showGallery, setShowGallery] = useState(false)
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
          {/* Bouton AJOUTER */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
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

              {filteredEntries.some(e => e.photo_url) && (
                <button
                  onClick={() => setShowGallery(true)}
                  className="btn"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center' }}
                >
                  <ImageIcon size={14} style={{ marginRight: '4px' }} />
                  Évolution
                </button>
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
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>#</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Poids (kg)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Cals</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Pas</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Séance</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>📷</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => {
                const dateParts = entry.date.split('-')
                const shortDate = `${dateParts[2]}/${dateParts[1]}`
                
                const entryProgram = entry.program_id ? programs.find(p => p.id === entry.program_id) : null
                const phaseDay = entryProgram ? Math.max(1, Math.floor((new Date(entry.date).getTime() - new Date(entryProgram.start_date).getTime()) / 86400000) + 1) : null

                return (
                  <tr 
                    key={entry.id} 
                    onClick={() => setEditEntry(entry)}
                    style={{ 
                      cursor: 'pointer', 
                      borderBottom: index === filteredEntries.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-card2)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{shortDate}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                      {phaseDay !== null ? `J${phaseDay}` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--accent)', fontWeight: 600 }}>{entry.weight ?? '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#fb923c' }}>{entry.calories ?? '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#818cf8' }}>{entry.steps ? formatNum(entry.steps) : '-'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {entry.workout_type ? (
                        <span className={`badge ${WORKOUT_BADGE_CLASS[entry.workout_type]}`} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                          {WORKOUT_EMOJI[entry.workout_type]}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dimmed)' }}>
                      {entry.photo_url ? '📷' : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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

      {showGallery && (
        <PhotoGalleryModal
          entries={filteredEntries}
          onClose={() => setShowGallery(false)}
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
