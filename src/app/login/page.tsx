'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { login, signup } from '@/app/actions/auth'
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const action = mode === 'login' ? login : signup
      const result = await action(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(ellipse at top, rgba(34,211,238,0.06) 0%, transparent 60%), var(--bg)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, var(--accent), #818cf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 0 40px var(--accent-glow)',
        }}>
          <Zap size={28} color="#000" fill="#000" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
          Zero <span className="gradient-text">Tracker</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {mode === 'login' ? 'Content de te revoir 💪' : 'Commence ta transformation'}
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-card2)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px',
          marginBottom: '1.5rem',
        }}>
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div>
            <label className="label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dimmed)' }}
              />
              <input
                name="email"
                type="email"
                placeholder="ton@email.com"
                required
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dimmed)' }}
              />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                minLength={6}
                className="input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-dimmed)', cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', height: '3rem' }}
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            ) : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '2rem', color: 'var(--text-dimmed)', fontSize: '0.8rem', textAlign: 'center' }}>
        En continuant, tu acceptes les conditions d&apos;utilisation
      </p>
    </div>
  )
}
