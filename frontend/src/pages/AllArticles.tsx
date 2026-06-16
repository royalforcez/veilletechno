import { useEffect, useMemo, useState } from 'react'
import type { Article } from '../types/article'
import { useArticles } from '../hooks/useArticles'
import ArticleCard from '../components/ArticleCard'
import FilterBar, { type Filters, type SortKey } from '../components/FilterBar'
import SkeletonCard from '../components/SkeletonCard'
import StatsBar from '../components/StatsBar'

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

function sortArticles(articles: Article[], key: SortKey): Article[] {
  return [...articles].sort((a, b) => {
    if (key === 'score') return b.score - a.score
    if (key === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (key === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
    return a.source.localeCompare(b.source, 'fr')
  })
}

export default function AllArticles() {
  const { articles, loading, error, lastRefreshed, refetch } = useArticles()
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    sortKey: 'score',
    scoreMin: 0,
    activeTags: [],
    activeSources: [],
  })

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(refetch, AUTO_REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [autoRefresh, refetch])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => a.tags?.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [articles])

  const allSources = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => set.add(a.source))
    return Array.from(set).sort()
  }, [articles])

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase()
    return sortArticles(
      articles.filter((a) => {
        if (a.score < filters.scoreMin) return false
        if (q && !a.titre.toLowerCase().includes(q) && !a.resume.toLowerCase().includes(q))
          return false
        if (filters.activeTags.length > 0 && !filters.activeTags.every((t) => a.tags?.includes(t)))
          return false
        if (filters.activeSources.length > 0 && !filters.activeSources.includes(a.source))
          return false
        return true
      }),
      filters.sortKey,
    )
  }, [articles, filters])

  if (error) return <p className="text-center text-red-500 py-20">Erreur : {error}</p>

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      {!loading && <StatsBar articles={articles} lastRefreshed={lastRefreshed} />}

      {/* Filtres */}
      <FilterBar
        filters={filters}
        allTags={allTags}
        allSources={allSources}
        onChange={setFilters}
      />

      {/* Barre outils : compteur + refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {loading ? 'Chargement...' : `${filtered.length} article${filtered.length !== 1 ? 's' : ''}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <span className={loading ? 'animate-spin inline-block' : 'inline-block'}>↻</span>
            Rafraîchir
          </button>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${
                autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}
            />
            Auto (5 min)
          </button>
        </div>
      </div>

      {/* Grille d'articles ou skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">Aucun article ne correspond à ces filtres.</p>
          <button
            onClick={() =>
              setFilters({ search: '', sortKey: 'score', scoreMin: 0, activeTags: [], activeSources: [] })
            }
            className="mt-3 text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  )
}
