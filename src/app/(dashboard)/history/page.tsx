import { getEntries } from '@/app/actions/entries'
import { getPrograms, getActiveProgram } from '@/app/actions/programs'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const [entries, programs, activeProgram] = await Promise.all([
    getEntries(200),
    getPrograms(),
    getActiveProgram(),
  ])

  return (
    <main className="page-container">
      {/* Header */}
      <div style={{ paddingTop: '0.5rem', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Historique
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
          {entries.length} entrée{entries.length > 1 ? 's' : ''} enregistrée{entries.length > 1 ? 's' : ''}
        </p>
      </div>

      <HistoryClient entries={entries} programs={programs} activeProgram={activeProgram} />
    </main>
  )
}
