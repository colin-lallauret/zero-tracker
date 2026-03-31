'use client'

import { useState } from 'react'
import EntryModal from '@/components/EntryModal'
import Fab from '@/components/Fab'
import type { Entry } from '@/lib/types'
import { Scale, Flame, Footprints, Plus } from 'lucide-react'

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
}

export default function HistoryClient({ entries }: HistoryClientProps) {
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [addDate, setAddDate] = useState<string | null>(null)

  return (
    <>
      {entries.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flex: 1, gap: '0.75rem',
          color: 'var(--text-dimmed)', textAlign: 'center',
          paddingTop: '3rem',
        }}>
          <span style={{ fontSize: '3rem' }}>📭</span>
          <p>Aucune entrée pour l'instant</p>
          <p style={{ fontSize: '0.8rem' }}>Commence par ajouter ta première entrée !</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {entries.map(entry => {
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

      <Fab />
    </>
  )
}
