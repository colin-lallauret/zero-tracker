'use client'

import { useState } from 'react'
import { EyeOff } from 'lucide-react'

interface BlurredImageProps {
  src: string
  alt: string
}

export default function BlurredImage({ src, alt }: BlurredImageProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        cursor: 'pointer',
        overflow: 'hidden'
      }}
      onClick={(e) => {
        // Stop propagation pour ne pas déclencher d'autres clics (ex: ouvrir l'entrée dans l'historique)
        e.stopPropagation()
        setRevealed(r => !r)
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: revealed ? 'none' : 'blur(15px) brightness(0.6)',
          transition: 'filter 0.4s ease, transform 0.4s ease',
          transform: revealed ? 'scale(1)' : 'scale(1.15)', // Cache les bords flous
        }}
      />
      
      {!revealed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          gap: '0.5rem',
          zIndex: 10,
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          <EyeOff size={28} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Appuie pour voir</span>
        </div>
      )}
    </div>
  )
}
