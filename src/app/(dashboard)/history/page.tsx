import { getEntries } from '@/app/actions/entries'
import { getPrograms, getActiveProgram } from '@/app/actions/programs'
import HistoryClient from './HistoryClient'
import HistoryHeader from '@/components/HistoryHeader'

export default async function HistoryPage() {
  const [entries, programs, activeProgram] = await Promise.all([
    getEntries(200),
    getPrograms(),
    getActiveProgram(),
  ])

  return (
    <main className="page-container">
      <HistoryHeader count={entries.length} />
      <HistoryClient entries={entries} programs={programs} activeProgram={activeProgram} />
    </main>
  )
}
