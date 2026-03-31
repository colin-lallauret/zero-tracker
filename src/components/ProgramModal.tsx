'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Plus, CheckCircle2, Circle, StopCircle, Trash2, Loader2, Zap, ChevronRight, Calendar } from 'lucide-react'
import {
  createProgram,
  setActiveProgram,
  endProgram,
  deleteProgram,
  type Program,
} from '@/app/actions/programs'

const PRESET_NAMES = [
  { label: 'Sèche', emoji: '🔥' },
  { label: 'Prise de masse', emoji: '💪' },
  { label: 'Reverse diet', emoji: '🔄' },
  { label: 'Maintien', emoji: '⚖️' },
  { label: 'Recomposition', emoji: '⚡' },
]

interface ProgramModalProps {
  onClose: () => void
  programs: Program[]
  activeProgram: Program | null
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function getDuration(start: string, end?: string | null) {
  const from = new Date(start)
  const to = end ? new Date(end) : new Date()
  const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  return days <= 1 ? '1 jour' : `${days} jours`
}

export default function ProgramModal({ onClose, programs, activeProgram }: ProgramModalProps) {
  const [view, setView] = useState<'list' | 'create'>('list')
  const [customName, setCustomName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [startDate] = useState(new Date().toISOString().split('T')[0])
  const [isPending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const finalName = customName.trim() || selectedPreset

  function handleCreate() {
    if (!finalName) {
      toast.error('Donne un nom à ton programme')
      return
    }
    startTransition(async () => {
      const result = await createProgram(finalName, startDate)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Programme "${finalName}" démarré 🚀`)
      onClose()
    })
  }

  function handleSetActive(id: string, name: string) {
    setActionId(id)
    startTransition(async () => {
      const result = await setActiveProgram(id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`"${name}" est maintenant actif ✅`)
      onClose()
    })
  }

  function handleEnd(id: string, name: string) {
    setActionId(id)
    startTransition(async () => {
      const result = await endProgram(id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Programme "${name}" terminé`)
      onClose()
    })
  }

  function handleDelete(id: string) {
    setActionId(id)
    startTransition(async () => {
      const result = await deleteProgram(id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Programme supprimé')
      onClose()
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '85dvh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {view === 'create' && (
              <button
                onClick={() => setView('list')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              >
                ←
              </button>
            )}
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {view === 'list' ? 'Programmes' : 'Nouveau programme'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                {view === 'list' ? 'Gère tes phases d\'entraînement' : 'Démarre une nouvelle phase'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {view === 'list' ? (
          <>
            {/* Bouton créer */}
            <button
              onClick={() => setView('create')}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              <Plus size={16} /> Nouveau programme
            </button>

            {programs.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem',
                color: 'var(--text-dimmed)', fontSize: '0.875rem',
              }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🏁</span>
                <p>Aucun programme créé</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Démarre ta première phase !</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {programs.map(prog => {
                  const isActive = prog.is_active
                  const isLoading = isPending && actionId === prog.id

                  return (
                    <div
                      key={prog.id}
                      className="card-sm"
                      style={{
                        borderColor: isActive ? 'var(--accent)' : 'var(--border-subtle)',
                        background: isActive ? 'rgba(34,211,238,0.04)' : 'var(--bg-card2)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        {/* Infos */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            {isActive
                              ? <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                              : <Circle size={15} style={{ color: 'var(--text-dimmed)', flexShrink: 0 }} />
                            }
                            <span style={{
                              fontWeight: 700, fontSize: '0.9rem',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {prog.name}
                            </span>
                            {isActive && (
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                                borderRadius: '99px', background: 'rgba(34,211,238,0.15)',
                                color: 'var(--accent)', flexShrink: 0,
                              }}>
                                ACTIF
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dimmed)', fontSize: '0.73rem' }}>
                            <Calendar size={11} />
                            <span>
                              {formatDate(prog.start_date)}
                              {prog.end_date ? ` → ${formatDate(prog.end_date)}` : ' → en cours'}
                            </span>
                          </div>
                          <div style={{ color: 'var(--text-dimmed)', fontSize: '0.73rem', marginTop: '2px' }}>
                            Durée : {getDuration(prog.start_date, prog.end_date)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                          {isLoading ? (
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)', marginTop: '4px' }} />
                          ) : (
                            <>
                              {!isActive && !prog.end_date && (
                                <button
                                  onClick={() => handleSetActive(prog.id, prog.name)}
                                  title="Reprendre"
                                  style={{
                                    background: 'rgba(34,211,238,0.1)', border: 'none',
                                    borderRadius: '8px', padding: '0.35rem 0.5rem',
                                    cursor: 'pointer', color: 'var(--accent)',
                                    display: 'flex', alignItems: 'center', gap: '3px',
                                    fontSize: '0.72rem', fontWeight: 600,
                                  }}
                                >
                                  <Zap size={12} /> Activer
                                </button>
                              )}
                              {isActive && (
                                <button
                                  onClick={() => handleEnd(prog.id, prog.name)}
                                  title="Terminer ce programme"
                                  style={{
                                    background: 'rgba(251,191,36,0.1)', border: 'none',
                                    borderRadius: '8px', padding: '0.35rem 0.5rem',
                                    cursor: 'pointer', color: '#fbbf24',
                                    display: 'flex', alignItems: 'center', gap: '3px',
                                    fontSize: '0.72rem', fontWeight: 600,
                                  }}
                                >
                                  <StopCircle size={12} /> Terminer
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(prog.id)}
                                title="Supprimer"
                                style={{
                                  background: 'rgba(248,113,113,0.1)', border: 'none',
                                  borderRadius: '8px', padding: '0.35rem 0.4rem',
                                  cursor: 'pointer', color: 'var(--red)', display: 'flex',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* Vue Création */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Presets */}
            <div>
              <label className="label">Choisir un type de phase</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {PRESET_NAMES.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(p.label)
                      setCustomName('')
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedPreset === p.label ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: selectedPreset === p.label ? 'rgba(34,211,238,0.08)' : 'var(--bg-card2)',
                      color: selectedPreset === p.label ? 'var(--accent)' : 'var(--text)',
                      cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{p.emoji} {p.label}</span>
                    {selectedPreset === p.label && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Ou nom perso */}
            <div>
              <label className="label">Ou un nom personnalisé</label>
              <input
                type="text"
                placeholder="Ex : Sèche été 2025, Bulk hiver..."
                value={customName}
                maxLength={50}
                onChange={e => {
                  setCustomName(e.target.value)
                  setSelectedPreset('')
                }}
                className="input"
              />
            </div>

            {/* Preview du nom final */}
            {finalName && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(34,211,238,0.06)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <Zap size={14} />
                Démarrer : &ldquo;{finalName}&rdquo;
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={!finalName || isPending}
              className="btn btn-primary"
              style={{ height: '3rem' }}
            >
              {isPending
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : '🚀 Démarrer le programme'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
