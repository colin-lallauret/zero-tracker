'use client'

import { X, ScanFace, EyeOff } from 'lucide-react'
import { useEffect } from 'react'

interface SettingsModalProps {
  faceBlur: boolean
  fullBlur: boolean
  onToggleFaceBlur: (val: boolean) => void
  onToggleFullBlur: (val: boolean) => void
  onClose: () => void
}

export default function SettingsModal({ faceBlur, fullBlur, onToggleFaceBlur, onToggleFullBlur, onClose }: SettingsModalProps) {
  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal animate-in"
        style={{ maxWidth: '380px', width: '95%', padding: '1.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Paramètres</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Préférences de l&apos;application</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '50%', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Privacy section */}
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dimmed)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.75rem' }}>
            Confidentialité
          </p>

          {/* Face blur toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              background: 'var(--bg-card2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              border: '1px solid var(--border)',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                background: faceBlur ? 'rgba(34,211,238,0.12)' : 'var(--bg-card)',
                borderRadius: '8px', padding: '0.4rem',
                color: faceBlur ? 'var(--accent)' : 'var(--text-dimmed)',
                transition: 'all 0.2s',
              }}>
                <ScanFace size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '1px' }}>
                  Flouter le visage
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Détection locale, aucune donnée envoyée
                </p>
              </div>
            </div>

            {/* Toggle switch for faceBlur */}
            <button
              type="button"
              role="switch"
              aria-checked={faceBlur}
              onClick={() => onToggleFaceBlur(!faceBlur)}
              style={{
                position: 'relative',
                width: '46px',
                height: '26px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                background: faceBlur ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.25s',
                flexShrink: 0,
                padding: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: faceBlur ? 'calc(100% - 23px)' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.25s',
                display: 'block',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          {/* Full blur toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              background: 'var(--bg-card2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                background: fullBlur ? 'rgba(34,211,238,0.12)' : 'var(--bg-card)',
                borderRadius: '8px', padding: '0.4rem',
                color: fullBlur ? 'var(--accent)' : 'var(--text-dimmed)',
                transition: 'all 0.2s',
              }}>
                <EyeOff size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '1px' }}>
                  Floutage de toute la photo
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Appuyer sur une image pour la voir
                </p>
              </div>
            </div>

            {/* Toggle switch for fullBlur */}
            <button
              type="button"
              role="switch"
              aria-checked={fullBlur}
              onClick={() => onToggleFullBlur(!fullBlur)}
              style={{
                position: 'relative',
                width: '46px',
                height: '26px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                background: fullBlur ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.25s',
                flexShrink: 0,
                padding: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: fullBlur ? 'calc(100% - 23px)' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.25s',
                display: 'block',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-dimmed)', marginTop: '0.6rem', lineHeight: 1.5, paddingLeft: '0.25rem' }}>
            💡 Le floutage est entièrement réalisé dans ton navigateur. Tes photos ne quittent jamais ton appareil lors de cette étape.
          </p>
        </div>
      </div>
    </div>
  )
}
