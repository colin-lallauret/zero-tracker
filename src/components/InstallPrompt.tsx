'use client'

import { useEffect, useState } from 'react'
import { Share, PlusSquare, X } from 'lucide-react'

export default function InstallPrompt() {
  const [isIosPromptVisible, setIsIosPromptVisible] = useState(false)

  useEffect(() => {
    // Check if device is iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent)
    }

    // Check if app is not installed (running in browser)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone)

    // Only show if iOS and NOT installed
    if (isIos() && !isStandalone) {
      const hasDismissed = localStorage.getItem('ios_install_dismissed')
      if (!hasDismissed) {
        setIsIosPromptVisible(true)
      }
    }
  }, [])

  if (!isIosPromptVisible) return null

  const dismiss = () => {
    localStorage.setItem('ios_install_dismissed', '1')
    setIsIosPromptVisible(false)
  }

  return (
    <div 
      className="card animate-in"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
        left: '1rem',
        right: '1rem',
        zIndex: 50,
        background: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--accent-dim)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      <button 
        onClick={dismiss}
        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
      >
        <X size={16} />
      </button>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <img src="/icon.svg" alt="App Icon" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 600 }}>Installer l'application</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dimmed)', lineHeight: 1.4 }}>
            Pour une meilleure expérience, installe cette application sur ton écran d'accueil :<br/>
            Touche <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> puis 
            <strong style={{ color: 'var(--text)', whiteSpace: 'nowrap' }}>
              <PlusSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} />
              Sur l'écran d'accueil
            </strong>
          </p>
        </div>
      </div>
    </div>
  )
}
