'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'
import type { Entry } from '@/lib/types'

interface WeightChartProps {
  entries: Entry[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '0.6rem 0.9rem',
      fontSize: '0.8rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 800 }}>
          {p.value} {p.dataKey === 'calories' ? 'kcal' : p.dataKey === 'steps' ? 'pas' : 'kg'}
        </p>
      ))}
    </div>
  )
}

type Metric = 'weight' | 'calories' | 'steps'

function MetricTabs({ metric, setMetric }: { metric: Metric, setMetric: (m: Metric) => void }) {
  return (
    <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
      <button onClick={() => setMetric('weight')} className="btn" style={{ flex: 1, padding: '0.4rem', border: 'none', background: metric === 'weight' ? 'rgba(34,211,238,0.15)' : 'transparent', color: metric === 'weight' ? 'var(--accent)' : 'var(--text-dimmed)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>⚖️ Poids</button>
      <button onClick={() => setMetric('calories')} className="btn" style={{ flex: 1, padding: '0.4rem', border: 'none', background: metric === 'calories' ? 'rgba(251,146,60,0.15)' : 'transparent', color: metric === 'calories' ? '#fb923c' : 'var(--text-dimmed)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>🔥 Cals</button>
      <button onClick={() => setMetric('steps')} className="btn" style={{ flex: 1, padding: '0.4rem', border: 'none', background: metric === 'steps' ? 'rgba(129,140,248,0.15)' : 'transparent', color: metric === 'steps' ? '#818cf8' : 'var(--text-dimmed)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>🚶 Pas</button>
    </div>
  )
}

export default function WeightChart({ entries }: WeightChartProps) {
  const [metric, setMetric] = useState<Metric>('weight')

  const data = [...entries]
    .filter(e => e[metric] !== null && e[metric] !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(e => ({
      date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      weight: e.weight ? parseFloat(String(e.weight)) : null,
      calories: e.calories ? parseInt(String(e.calories)) : null,
      steps: e.steps ? parseInt(String(e.steps)) : null,
    }))

  if (data.length < 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <MetricTabs metric={metric} setMetric={setMetric} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', color: 'var(--text-dimmed)', fontSize: '0.85rem', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>📊</span>
          <span>Ajoute au moins 2 données pour voir ce graphique</span>
        </div>
      </div>
    )
  }

  const values = data.map(d => d[metric]).filter(v => v !== null) as number[]
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  
  // Configurations specifiques
  const color = metric === 'weight' ? 'var(--accent)' : metric === 'calories' ? '#fb923c' : '#818cf8'
  const fillUrl = metric === 'weight' ? 'url(#accentGrad)' : metric === 'calories' ? 'url(#calGrad)' : 'url(#stepsGrad)'
  
  const padding = metric === 'weight' ? 0.5 : metric === 'calories' ? 200 : 1000

  return (
    <div>
      <MetricTabs metric={metric} setMetric={setMetric} />
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: metric === 'weight' ? -20 : -10, bottom: 0 }}>
          <defs>
            <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-dimmed)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            domain={[Math.max(0, minVal - padding), maxVal + padding]}
            tick={{ fill: 'var(--text-dimmed)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickCount={4}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-card2)' }} />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={color}
            fill={fillUrl}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
