'use client'

import { useState } from 'react'
import { LogOut, Settings } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import SettingsModal from '@/components/SettingsModal'
import { usePrivacySettings } from '@/hooks/useFaceBlur'

interface DashboardHeaderProps {
  email: string | undefined
}

export default function DashboardHeader({ email }: DashboardHeaderProps) {
  const [showSettings, setShowSettings] = useState(false)
  const { faceBlur, fullBlur, setFaceBlur, setFullBlur } = usePrivacySettings()

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingTop: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Zero <span className="gradient-text">Tracker</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            {email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-ghost"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px' }}
            title="Paramètres"
          >
            <Settings size={15} />
          </button>
          {/* Logout button */}
          <form action={logout}>
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px' }}
              title="Se déconnecter"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
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
