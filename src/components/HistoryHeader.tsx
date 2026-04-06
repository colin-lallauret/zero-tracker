'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import SettingsModal from '@/components/SettingsModal'
import { usePrivacySettings } from '@/hooks/useFaceBlur'

interface HistoryHeaderProps {
  count: number
}

export default function HistoryHeader({ count }: HistoryHeaderProps) {
  const [showSettings, setShowSettings] = useState(false)
  const { faceBlur, fullBlur, setFaceBlur, setFullBlur } = usePrivacySettings()

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Historique
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            {count} entrée{count > 1 ? 's' : ''} enregistrée{count > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="btn btn-ghost"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px' }}
          title="Paramètres"
        >
          <Settings size={15} />
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          faceBlur={faceBlur}
          fullBlur={fullBlur}
          onToggleFaceBlur={setFaceBlur}
          onToggleFullBlur={setFullBlur}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  )
}
