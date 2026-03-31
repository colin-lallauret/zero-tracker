'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import EntryModal from './EntryModal'
import type { Entry } from '@/lib/types'

interface FabProps {
  todayEntry?: Entry | null
}

export default function Fab({ todayEntry }: FabProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="fab"
        onClick={() => setOpen(true)}
        aria-label="Ajouter une entrée"
        title="Ajouter une entrée"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {open && (
        <EntryModal
          existing={todayEntry}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
