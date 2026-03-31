import { getEntries, getTodayEntry } from '@/app/actions/entries'
import { logout } from '@/app/actions/auth'
import { getPrograms, getActiveProgram } from '@/app/actions/programs'
import { createClient } from '@/lib/supabase/server'
import WeightChart from '@/components/WeightChart'
import Fab from '@/components/Fab'
import ProgramBanner from '@/components/ProgramBanner'
import { Scale, Flame, Footprints, TrendingDown, TrendingUp, LogOut } from 'lucide-react'
import type { Entry } from '@/lib/types'

const WORKOUT_BADGE_CLASS: Record<string, string> = {
  'Gym': 'badge-gym',
  'Cardio': 'badge-cardio',
  'Repos': 'badge-repos',
  'Gym + Cardio': 'badge-gymcardio',
}



function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [entries, todayEntry, activeProgram, programs] = await Promise.all([
    getEntries(30),
    getTodayEntry(),
    getActiveProgram(),
    getPrograms(),
  ])

  // Phase stats : entrées du programme actif, tri croissant
  const programEntries = activeProgram
    ? [...entries].filter(e => e.program_id === activeProgram.id)
    : []
  // entries est déjà trié desc (plus récent en premier)
  const programWeights = programEntries.filter(e => e.weight !== null)
  const startWeight = programWeights.length > 0
    ? programWeights[programWeights.length - 1].weight! // la plus ancienne
    : null
  const currentWeight = programWeights.length > 0
    ? programWeights[0].weight! // la plus récente
    : (todayEntry?.weight ?? null)
  const phaseDelta = startWeight !== null && currentWeight !== null && startWeight !== currentWeight
    ? parseFloat((currentWeight - startWeight).toFixed(1))
    : null

  const today = new Date().toISOString().split('T')[0]
  const isToday = todayEntry?.date === today

  return (
    <main className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingTop: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Zero <span className="gradient-text">Tracker</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            {user?.email}
          </p>
        </div>
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

      {/* Programme banner */}
      <ProgramBanner activeProgram={activeProgram} programs={programs} />

      {/* Today card */}
      <div className="card animate-in" style={{ marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '-50%', right: '-20%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Aujourd&apos;hui
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: '2px', textTransform: 'capitalize' }}>
              {formatDate(today)}
            </p>
          </div>
          {todayEntry?.workout_type && (
            <span className={`badge ${WORKOUT_BADGE_CLASS[todayEntry.workout_type]}`}>
              {todayEntry.workout_type}
            </span>
          )}
        </div>

        {isToday && todayEntry ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <StatCell icon={<Scale size={14} />} label="Poids" value={todayEntry.weight ? `${todayEntry.weight}` : '—'} unit="kg" />
            <StatCell icon={<Flame size={14} />} label="Calories" value={todayEntry.calories ? `${todayEntry.calories}` : '—'} unit="kcal" />
            <StatCell icon={<Footprints size={14} />} label="Pas" value={todayEntry.steps ? formatNum(todayEntry.steps) : '—'} />
          </div>
        ) : (
          <div style={{
            padding: '1.25rem',
            textAlign: 'center',
            color: 'var(--text-dimmed)',
            fontSize: '0.875rem',
            background: 'var(--bg-card2)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.4rem' }}>📋</span>
            Aucune entrée pour aujourd&apos;hui — utilise le bouton <strong style={{ color: 'var(--accent)' }}>+</strong>
          </div>
        )}

        {todayEntry?.photo_url && (
          <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '16/7' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={todayEntry.photo_url} alt="Photo du jour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Stats de la phase */}
      <div className="card animate-in" style={{ marginBottom: '1rem', animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {activeProgram ? activeProgram.name : 'Ma progression'}
          </h2>
          {phaseDelta !== null && (
            <span
              className="badge"
              style={{
                background: phaseDelta < 0 ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                color: phaseDelta < 0 ? 'var(--green)' : 'var(--red)',
                fontWeight: 800, fontSize: '0.85rem', padding: '4px 10px',
              }}
            >
              {phaseDelta < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
              {phaseDelta > 0 ? '+' : ''}{phaseDelta} kg
            </span>
          )}
        </div>

        {startWeight !== null || currentWeight !== null ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            {/* Poids de départ */}
            <div className="card-sm" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginBottom: '0.35rem', fontWeight: 500 }}>DÉPART</div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {startWeight !== null ? startWeight : '—'}
              </div>
              <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginTop: '3px' }}>kg</div>
            </div>

            {/* Delta central — mis en valeur */}
            <div style={{
              textAlign: 'center', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: phaseDelta === null ? 'var(--bg-card2)'
                : phaseDelta < 0 ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem',
            }}>
              <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginBottom: '0.35rem', fontWeight: 500 }}>VARIATION</div>
              <div style={{
                fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.03em', lineHeight: 1,
                color: phaseDelta === null ? 'var(--text-dimmed)'
                  : phaseDelta < 0 ? 'var(--green)' : phaseDelta > 0 ? 'var(--red)' : 'var(--text)',
              }}>
                {phaseDelta !== null ? `${phaseDelta > 0 ? '+' : ''}${phaseDelta}` : '—'}
              </div>
              {phaseDelta !== null && <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginTop: '3px' }}>kg</div>}
            </div>

            {/* Poids actuel */}
            <div className="card-sm" style={{ textAlign: 'center', borderColor: currentWeight !== null ? 'var(--accent)' : undefined }}>
              <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginBottom: '0.35rem', fontWeight: 500 }}>ACTUEL</div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1, color: currentWeight !== null ? 'var(--accent)' : 'var(--text)' }}>
                {currentWeight !== null ? currentWeight : '—'}
              </div>
              <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginTop: '3px' }}>kg</div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '1rem', textAlign: 'center', color: 'var(--text-dimmed)',
            fontSize: '0.82rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)',
          }}>
            ⚖️ Ajoute ton poids pour suivre ta progression
          </div>
        )}

        {!activeProgram && (
          <p style={{ color: 'var(--text-dimmed)', fontSize: '0.72rem', marginTop: '0.75rem', textAlign: 'center' }}>
            Démarre un programme pour suivre ta progression par phase
          </p>
        )}
      </div>

      {/* Weight chart */}
      {entries.length > 0 && (
        <div className="card animate-in" style={{ marginBottom: '1rem', animationDelay: '0.1s' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Évolution du poids</h2>
          <WeightChart entries={entries} />
        </div>
      )}

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="animate-in" style={{ animationDelay: '0.15s' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
            Entrées récentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {entries.slice(0, 5).map(entry => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      <Fab todayEntry={todayEntry} />
    </main>
  )
}

function StatCell({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: 'var(--text-dimmed)', fontSize: '0.7rem', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: '1.4rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      {unit && <div style={{ color: 'var(--text-dimmed)', fontSize: '0.7rem', marginTop: '2px' }}>{unit}</div>}
    </div>
  )
}



function EntryRow({ entry }: { entry: Entry }) {
  const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
  return (
    <div className="card-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{dateLabel}</p>
        <p style={{ color: 'var(--text-dimmed)', fontSize: '0.75rem', marginTop: '2px' }}>
          {[
            entry.weight ? `${entry.weight} kg` : null,
            entry.calories ? `${entry.calories} kcal` : null,
            entry.steps ? `${formatNum(entry.steps)} pas` : null,
          ].filter(Boolean).join(' · ')}
        </p>
      </div>
      {entry.workout_type && (
        <span className={`badge ${WORKOUT_BADGE_CLASS[entry.workout_type]}`} style={{ flexShrink: 0, fontSize: '0.7rem' }}>
          {entry.workout_type}
        </span>
      )}
    </div>
  )
}

function formatNum(n: number) {
  return n.toLocaleString('fr-FR')
}
