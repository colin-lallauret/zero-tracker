'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Scale, Flame, Footprints, Dumbbell, Camera, FileText, Loader2, Calendar, Trash2, ImagePlus } from 'lucide-react'
import { upsertEntry, deleteEntry, uploadPhoto } from '@/app/actions/entries'
import type { Entry, WorkoutType } from '@/lib/types'
import PhotoWithBlur from '@/components/PhotoWithBlur'

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

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 1200
      const MAX_HEIGHT = 1200
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }))
        } else {
          reject(new Error('Canvas toBlob failed'))
        }
      }, 'image/jpeg', 0.8)
    }
    img.onerror = reject
  })
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
          const compressed = await compressImage(photoFile)
          const formData = new FormData()
          formData.append('file', compressed)
          photo_url = await uploadPhoto(formData)
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
                type="text"
                placeholder="75.0"
                value={weight}
                onChange={e => {
                  const val = e.target.value.replace(',', '.')
                  if (/^\d*\.?\d*$/.test(val)) {
                    setWeight(val)
                  }
                }}
                className="input"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flame size={12} /> Calories
              </label>
              <input
                type="text"
                placeholder="2000"
                value={calories}
                onChange={e => {
                  const val = e.target.value
                  if (/^\d*$/.test(val)) setCalories(val)
                }}
                className="input"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Footprints size={12} /> Pas
            </label>
            <input
              type="text"
              placeholder="10000"
              value={steps}
              onChange={e => {
                const val = e.target.value
                if (/^\d*$/.test(val)) setSteps(val)
              }}
              className="input"
              inputMode="numeric"
              pattern="[0-9]*"
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
              <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '3/4', backgroundColor: 'var(--bg-card)' }}>
                <PhotoWithBlur src={photoPreview} alt="Preview" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setPhotoFile(null) }}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    padding: '0.3rem', cursor: 'pointer', color: '#fff', display: 'flex',
                    zIndex: 20,
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
