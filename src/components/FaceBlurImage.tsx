'use client'

import { useEffect, useRef, useState } from 'react'
import { EyeOff } from 'lucide-react'

interface FaceBlurImageProps {
  src: string
  alt: string
  /** If false, show the image normally (no face blur, no privacy overlay) */
  blurFaces?: boolean
  /** If true, applies a full CSS blur and an EyeOff overlay until clicked */
  fullBlur?: boolean
}

type BlazeFaceModel = {
  estimateFaces: (img: HTMLImageElement, returnTensors: boolean) => Promise<Array<{
    topLeft: [number, number]
    bottomRight: [number, number]
  }>>
}

let modelCache: BlazeFaceModel | null = null
let modelLoading: Promise<BlazeFaceModel> | null = null

async function loadModel(): Promise<BlazeFaceModel> {
  if (modelCache) return modelCache
  if (modelLoading) return modelLoading

  modelLoading = (async () => {
    // Dynamic import to avoid SSR issues & only load when needed
    const tf = await import('@tensorflow/tfjs')
    await tf.ready()
    const blazeface = await import('@tensorflow-models/blazeface')
    const model = await blazeface.load()
    modelCache = model as unknown as BlazeFaceModel
    return modelCache
  })()

  return modelLoading
}

export default function FaceBlurImage({ src, alt, blurFaces = true, fullBlur = true }: FaceBlurImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [hasFaces, setHasFaces] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!blurFaces) {
      setDone(true)
      return
    }

    let cancelled = false

    async function process() {
      setProcessing(true)
      setDone(false)

      const canvas = canvasRef.current
      if (!canvas) return

      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = src

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Image load failed'))
      })

      if (cancelled) return
      imgRef.current = img

      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      try {
        const model = await loadModel()
        if (cancelled) return

        const predictions = await model.estimateFaces(img, false)
        if (cancelled) return

        if (predictions.length > 0) {
          setHasFaces(true)
          // Apply blur to each detected face area
          for (const pred of predictions) {
            const [x1, y1] = pred.topLeft
            const [x2, y2] = pred.bottomRight
            const pw = x2 - x1
            const ph = y2 - y1
            // Add 60% padding around the face box to generously cover hair/chin/neck
            const pad = 0.6
            const bx = Math.max(0, x1 - pw * pad)
            const by = Math.max(0, y1 - ph * pad)
            const bw = Math.min(canvas.width - bx, pw * (1 + pad * 2))
            const bh = Math.min(canvas.height - by, ph * (1 + pad * 2))

            // Pixelate approach: downscale then upscale for a classic blur
            const BLUR_SCALE = 0.05 // 5% → very pixelated
            const tmpCanvas = document.createElement('canvas')
            tmpCanvas.width = Math.max(1, Math.round(bw * BLUR_SCALE))
            tmpCanvas.height = Math.max(1, Math.round(bh * BLUR_SCALE))
            const tmpCtx = tmpCanvas.getContext('2d')!
            tmpCtx.imageSmoothingEnabled = true
            tmpCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, tmpCanvas.width, tmpCanvas.height)

            // Draw pixelated back
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(tmpCanvas, 0, 0, tmpCanvas.width, tmpCanvas.height, bx, by, bw, bh)
            ctx.imageSmoothingEnabled = true
          }
        } else {
          setHasFaces(false)
        }
      } catch {
        // Model failed → draw the original image unmodified
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        setHasFaces(false)
      }

      if (!cancelled) {
        setProcessing(false)
        setDone(true)
      }
    }

    process()
    return () => { cancelled = true }
  }, [src, blurFaces])

  // Fast path: No face blur
  if (!blurFaces) {
    if (!fullBlur) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )
    } else {
      return <SimpleBlurredImage src={src} alt={alt} />
    }
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: fullBlur ? 'pointer' : 'default' }}
      onClick={(e) => { 
        if (fullBlur) {
          e.stopPropagation()
          setRevealed(r => !r) 
        }
      }}
    >
      {/* Canvas with pixelated face */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: done ? 'block' : 'none',
          filter: (fullBlur && !revealed) ? 'blur(15px) brightness(0.6)' : 'none',
          transform: (fullBlur && !revealed) ? 'scale(1.15)' : 'scale(1)',
          transition: 'filter 0.4s ease, transform 0.4s ease',
        }}
      />

      {/* Fallback img while processing: always blurred to hide faces initially */}
      {!done && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'blur(20px) brightness(0.5)',
            transform: 'scale(1.2)',
          }}
        />
      )}

      {/* Privacy overlay shown if fullBlur is ON and it has not been revealed */}
      {fullBlur && !revealed && done && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', gap: '0.5rem', zIndex: 10, textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          <EyeOff size={28} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Appuie pour voir</span>
        </div>
      )}

      {/* Loading indicator */}
      {processing && (
        <div style={{
          position: 'absolute', bottom: '0.5rem', right: '0.5rem',
          background: 'rgba(0,0,0,0.6)', borderRadius: '6px', padding: '2px 8px',
          fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', zIndex: 20,
        }}>
          🔍 Analyse...
        </div>
      )}
    </div>
  )
}

/** Fallback: full-photo CSS blur with tap-to-reveal (used when blurFaces=false) */
function SimpleBlurredImage({ src, alt }: { src: string; alt: string }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer', overflow: 'hidden' }}
      onClick={(e) => { e.stopPropagation(); setRevealed(r => !r) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          filter: revealed ? 'none' : 'blur(15px) brightness(0.6)',
          transition: 'filter 0.4s ease, transform 0.4s ease',
          transform: revealed ? 'scale(1)' : 'scale(1.15)',
        }}
      />
      {!revealed && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', gap: '0.5rem', zIndex: 10, textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          <EyeOff size={28} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Appuie pour voir</span>
        </div>
      )}
    </div>
  )
}
