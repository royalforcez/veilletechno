import type { Article } from '../types/article'

interface StatsBarProps {
  articles: Article[]
  lastRefreshed: Date | null
}

export default function StatsBar({ articles, lastRefreshed }: StatsBarProps) {
  const total = articles.length
  const avgScore = total > 0 ? articles.reduce((s, a) => s + a.score, 0) / total : 0
  const topCount = articles.filter((a) => a.is_top).length
  const recentCount = articles.filter(
    (a) => Date.now() - new Date(a.date).getTime() < 48 * 3600 * 1000,
  ).length

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Articles" value={String(total)} />
        <StatCard label="Score moyen" value={`${Math.round(avgScore * 100)}%`} />
        <StatCard label="Top articles" value={String(topCount)} highlight />
        <StatCard label="Récents (48h)" value={String(recentCount)} />
      </div>
      {lastRefreshed && (
        <p className="text-xs text-gray-400 text-right">
          Mis à jour à {lastRefreshed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}
