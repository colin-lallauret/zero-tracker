import { getEntries, getTodayEntry } from '@/app/actions/entries'
import { logout } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import WeightChart from '@/components/WeightChart'
import Fab from '@/components/Fab'
import { Scale, Flame, Footprints, TrendingDown, TrendingUp, Minus, LogOut } from 'lucide-react'
import type { Entry } from '@/lib/types'

const WORKOUT_BADGE_CLASS: Record<string, string> = {
  'Gym': 'badge-gym',
  'Cardio': 'badge-cardio',
  'Repos': 'badge-repos',
  'Gym + Cardio': 'badge-gymcardio',
}

function avg(entries: Entry[], key: keyof Entry): number | null {
  const vals = entries.map(e => e[key]).filter(v => v !== null) as number[]
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [entries, todayEntry] = await Promise.all([
    getEntries(30),
    getTodayEntry(),
  ])

  const last7 = entries.slice(0, 7)
  const avgWeight = avg(last7, 'weight')
  const avgCal = avg(last7, 'calories')
  const avgSteps = avg(last7, 'steps')

  // Weight trend vs previous week
  const prev7 = entries.slice(7, 14)
  const prevAvgWeight = avg(prev7, 'weight')
  const weightDelta = avgWeight !== null && prevAvgWeight !== null
    ? parseFloat((avgWeight - prevAvgWeight).toFixed(1))
    : null

  const today = new Date().toISOString().split('T')[0]
  const isToday = todayEntry?.date === today

  return (
    <main className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
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
              Aujourd'hui
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
            Aucune entrée pour aujourd'hui — utilise le bouton <strong style={{ color: 'var(--accent)' }}>+</strong>
          </div>
        )}

        {todayEntry?.photo_url && (
          <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '16/7' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={todayEntry.photo_url} alt="Photo du jour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Stats 7 jours */}
      <div className="card animate-in" style={{ marginBottom: '1rem', animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Moyennes 7 jours</h2>
          {weightDelta !== null && (
            <span
              className="badge"
              style={{
                background: weightDelta < 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                color: weightDelta < 0 ? 'var(--green)' : 'var(--red)',
              }}
            >
              {weightDelta < 0 ? <TrendingDown size={12} /> : weightDelta > 0 ? <TrendingUp size={12} /> : <Minus size={12} />}
              {Math.abs(weightDelta)} kg
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <StatCard
            icon={<Scale size={16} />}
            label="Poids moy."
            value={avgWeight ? avgWeight.toFixed(1) : '—'}
            unit="kg"
            color="var(--accent)"
          />
          <StatCard
            icon={<Flame size={16} />}
            label="Calories"
            value={avgCal ? Math.round(avgCal).toString() : '—'}
            unit="kcal"
            color="#fb923c"
          />
          <StatCard
            icon={<Footprints size={16} />}
            label="Pas moy."
            value={avgSteps ? formatNum(Math.round(avgSteps)) : '—'}
            color="#818cf8"
          />
        </div>
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

function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="card-sm" style={{ textAlign: 'center' }}>
      <div style={{ color: color ?? 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      {unit && <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginTop: '2px' }}>{unit}</div>}
      <div style={{ color: 'var(--text-dimmed)', fontSize: '0.65rem', marginTop: '4px' }}>{label}</div>
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
