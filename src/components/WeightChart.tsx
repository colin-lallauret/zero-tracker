'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { Entry } from '@/lib/types'

interface WeightChartProps {
  entries: Entry[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '0.6rem 0.9rem',
      fontSize: '0.8rem',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{payload[0].value} kg</p>
    </div>
  )
}

export default function WeightChart({ entries }: WeightChartProps) {
  const data = [...entries]
    .filter(e => e.weight !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(e => ({
      date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      weight: parseFloat(String(e.weight)),
    }))

  if (data.length < 2) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '140px',
        color: 'var(--text-dimmed)',
        fontSize: '0.85rem',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '2rem' }}>📊</span>
        <span>Ajoute au moins 2 pesées pour voir le graphique</span>
      </div>
    )
  }

  const weights = data.map(d => d.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const padding = 0.5

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-dimmed)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minW - padding, maxW + padding]}
          tick={{ fill: 'var(--text-dimmed)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickCount={4}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="url(#accentGrad)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: 'var(--accent)', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
