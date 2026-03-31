'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Scale, Flame, Footprints, Dumbbell, Camera, FileText, Loader2, Calendar, Trash2, ImagePlus } from 'lucide-react'
import { upsertEntry, deleteEntry } from '@/app/actions/entries'
import type { Entry, WorkoutType } from '@/lib/types'

const WORKOUT_OPTIONS: { value: WorkoutType; label: string; emoji: string }[] = [
  { value: 'Gym', label: 'Gym', emoji: '🏋️' },
  { value: 'Cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'Repos', label: 'Repos', emoji: '😴' },
  { value: 'Gym + Cardio', label: 'Gym + Cardio', emoji: '⚡' },
]

const WORKOUT_BADGE_CLASS: Record<WorkoutType, string> = {
  'Gym': 'badge-gym',
  'Cardio': 'badge-cardio',
  'Repos': 'badge-repos',
  'Gym + Cardio': 'badge-gymcardio',
}

interface EntryModalProps {
  onClose: () => void
  existing?: Entry | null
  defaultDate?: string
}

export default function EntryModal({ onClose, existing, defaultDate }: EntryModalProps) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(existing?.date ?? defaultDate ?? today)
  const [weight, setWeight] = useState(existing?.weight?.toString() ?? '')
  const [calories, setCalories] = useState(existing?.calories?.toString() ?? '')
  const [steps, setSteps] = useState(existing?.steps?.toString() ?? '')
  const [workout, setWorkout] = useState<WorkoutType | ''>(existing?.workout_type ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(existing?.photo_url ?? null)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      try {
        let photo_url = existing?.photo_url ?? null

        if (photoFile) {
          const { uploadPhoto } = await import('@/app/actions/entries')
          photo_url = await uploadPhoto(photoFile)
        }

        const result = await upsertEntry({
          date,
          weight: weight ? parseFloat(weight) : null,
          calories: calories ? parseInt(calories) : null,
          steps: steps ? parseInt(steps) : null,
          workout_type: workout || null,
          photo_url,
          notes: notes || null,
        })

        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success(existing ? 'Entrée mise à jour ✅' : 'Entrée enregistrée 🔥')
          onClose()
        }
      } catch {
        toast.error('Une erreur est survenue')
      }
    })
  }

  function handleDelete() {
    if (!existing) return
    startDeleteTransition(async () => {
      const result = await deleteEntry(existing.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Entrée supprimée')
        onClose()
      }
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {existing ? 'Modifier' : 'Nouvelle entrée'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
              {existing ? 'Mise à jour de ton entrée' : 'Saisie du jour'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Date */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={12} /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={today}
              className="input"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Weight + Calories row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Scale size={12} /> Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="999"
                placeholder="75.0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="input"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flame size={12} /> Calories
              </label>
              <input
                type="number"
                min="0"
                max="9999"
                placeholder="2000"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                className="input"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Footprints size={12} /> Pas
            </label>
            <input
              type="number"
              min="0"
              max="99999"
              placeholder="10000"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              className="input"
              inputMode="numeric"
            />
          </div>

          {/* Workout type */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Dumbbell size={12} /> Type de séance
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {WORKOUT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWorkout(workout === opt.value ? '' : opt.value)}
                  className={`badge ${WORKOUT_BADGE_CLASS[opt.value]}`}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: workout === opt.value ? '1px solid currentColor' : '1px solid transparent',
                    background: workout === opt.value ? undefined : 'var(--bg-card2)',
                    color: workout === opt.value ? undefined : 'var(--text-muted)',
                    justifyContent: 'flex-start',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                  }}
                >
                  <span>{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Camera size={12} /> Photo (optionnel)
            </label>
            {/* Input caméra (capture directe) */}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
            {/* Input galerie (sans capture) */}
            <input ref={galleryRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

            {photoPreview ? (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '16/9' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    padding: '0.3rem', cursor: 'pointer', color: '#fff', display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {/* Bouton Caméra */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card2)',
                    color: 'var(--text-muted)',
                    padding: '1rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <Camera size={20} />
                  <span>Prendre une photo</span>
                </button>

                {/* Bouton Galerie */}
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  style={{
                    border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card2)',
                    color: 'var(--text-muted)',
                    padding: '1rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <ImagePlus size={20} />
                  <span>Depuis la galerie</span>
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={12} /> Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Comment tu te sens aujourd'hui ?"
              rows={2}
              className="input"
              style={{ resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            {existing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger"
                style={{ flexShrink: 0 }}
              >
                {isDeleting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
              style={{ flex: 1, height: '3rem' }}
            >
              {isPending
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : existing ? 'Mettre à jour' : 'Enregistrer 🔥'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
