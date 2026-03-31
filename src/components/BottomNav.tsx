'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, History } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/history', label: 'Historique', Icon: History },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0.6rem 0',
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--text-dimmed)',
              fontSize: '0.7rem',
              fontWeight: active ? 600 : 400,
              transition: 'color 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.5}
              style={{
                filter: active ? 'drop-shadow(0 0 6px var(--accent))' : 'none',
                transition: 'all 0.2s',
              }}
            />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
