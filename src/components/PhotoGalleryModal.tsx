'use client'

import { X, ArrowRight } from 'lucide-react'
import type { Entry } from '@/lib/types'

interface PhotoGalleryModalProps {
  entries: Entry[]
  onClose: () => void
}

export default function PhotoGalleryModal({ entries, onClose }: PhotoGalleryModalProps) {
  // On récupère uniquement celles qui ont une photo, et on les trie de la plus ancienne à la plus récente
  const photoEntries = [...entries]
    .filter(e => e.photo_url)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (photoEntries.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700 }}>Galerie Avant/Après</h2>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem', border: 'none' }}><X size={20}/></button>
          </div>
          <p style={{ color: 'var(--text-dimmed)', textAlign: 'center', margin: '2rem 0' }}>Aucune photo pour l&apos;instant dans cette phase !</p>
        </div>
      </div>
    )
  }

  const oldest = photoEntries[0]
  const newest = photoEntries[photoEntries.length - 1]
  const hasMultiple = photoEntries.length > 1

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent)', letterSpacing: '-0.02em' }}>Évolution Physique</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ton parcours en images</p>
          </div>
          <button 
            onClick={onClose} 
            className="btn" 
            style={{ background: 'var(--bg-card2)', border: 'none', color: 'var(--text)', padding: '0.5rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {hasMultiple ? (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
            {/* AVANT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={oldest.photo_url!} alt="Avant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#fff', backdropFilter: 'blur(4px)' }}>
                  {oldest.weight ? `${oldest.weight} kg` : 'Départ'}
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avant</p>
            </div>
            
            <div style={{ color: 'var(--text-dimmed)', padding: '0 0.2rem' }}>
              <ArrowRight size={20} strokeWidth={3} />
            </div>

            {/* APRÈS */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', boxShadow: '0 0 0 2px var(--accent), 0 4px 20px rgba(34,211,238,0.3)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newest.photo_url!} alt="Après" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'var(--accent)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#000' }}>
                  {newest.weight ? `${newest.weight} kg` : "Aujourd'hui"}
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Après</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '80%', background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={oldest.photo_url!} alt="Première photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ajoute d&apos;autres photos pour débloquer la vue Avant/Après !</p>
          </div>
        )}

        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-dimmed)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Historique Complet ({photoEntries.length})
          </h3>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '0.75rem', paddingBottom: '1rem', scrollSnapType: 'x mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {[...photoEntries].reverse().map(e => (
              <div key={e.id} style={{ flex: '0 0 90px', scrollSnapAlign: 'start', position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '3/4', backgroundColor: 'var(--bg-card)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.photo_url!} alt="Timeline" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '12px 4px 4px', fontSize: '0.7rem', color: '#fff', fontWeight: 700, textAlign: 'center' }}>
                  {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
