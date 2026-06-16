interface ScoreBadgeProps {
  score: number // 0.0 – 1.0
}

function colorClass(score: number) {
  if (score >= 0.75) return { badge: 'bg-green-500 text-white', bar: 'bg-green-500', border: 'border-l-green-500' }
  if (score >= 0.6)  return { badge: 'bg-amber-400 text-amber-900', bar: 'bg-amber-400', border: 'border-l-amber-400' }
  if (score >= 0.4)  return { badge: 'bg-orange-400 text-white', bar: 'bg-orange-400', border: 'border-l-orange-400' }
  return               { badge: 'bg-red-500 text-white', bar: 'bg-red-500', border: 'border-l-red-500' }
}

export function scoreColors(score: number) {
  return colorClass(score)
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const pct = Math.round(score * 100)
  const { badge, bar } = colorClass(score)

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums ${badge}`}>
        {pct}%
      </span>
      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
