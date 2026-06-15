import { useArticles } from '../hooks/useArticles'
import ArticleCard from '../components/ArticleCard'
import SkeletonCard from '../components/SkeletonCard'

const TOP_N = 10

export default function TopArticles() {
  const { articles, loading, error } = useArticles()

  if (error) return <p className="text-center text-red-500 py-20">Erreur : {error}</p>

  const top = [...articles].sort((a, b) => b.score - a.score).slice(0, TOP_N)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Top {TOP_N} articles</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Les articles les mieux notés par le système de scoring
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {top.map((a, i) => (
            <div key={a.id} className="relative">
              {i < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-amber-400 text-amber-900 text-xs font-bold flex items-center justify-center shadow-sm">
                  #{i + 1}
                </div>
              )}
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
