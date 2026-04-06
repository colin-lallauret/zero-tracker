'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY_FACE = 'zero-tracker:face-blur'
const STORAGE_KEY_FULL = 'zero-tracker:full-blur'

export function usePrivacySettings() {
  const [faceBlur, setFaceBlurState] = useState(true) // default ON
  const [fullBlur, setFullBlurState] = useState(true) // default ON

  useEffect(() => {
    try {
      const storedFace = localStorage.getItem(STORAGE_KEY_FACE)
      if (storedFace !== null) setFaceBlurState(JSON.parse(storedFace))
      
      const storedFull = localStorage.getItem(STORAGE_KEY_FULL)
      if (storedFull !== null) setFullBlurState(JSON.parse(storedFull))
    } catch {
      // ignore
    }
  }, [])

  function setFaceBlur(val: boolean) {
    setFaceBlurState(val)
    try { localStorage.setItem(STORAGE_KEY_FACE, JSON.stringify(val)) } catch {}
  }

  function setFullBlur(val: boolean) {
    setFullBlurState(val)
    try { localStorage.setItem(STORAGE_KEY_FULL, JSON.stringify(val)) } catch {}
  }

  return { faceBlur, fullBlur, setFaceBlur, setFullBlur }
}
