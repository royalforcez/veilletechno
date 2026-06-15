import { useState, useEffect, useCallback } from 'react'
import type { Article } from '../types/article'
import { fetchArticles } from '../api/articles'

interface UseArticlesResult {
  articles: Article[]
  loading: boolean
  error: string | null
  lastRefreshed: Date | null
  refetch: () => void
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchArticles()
      .then((data) => {
        setArticles(data)
        setLastRefreshed(new Date())
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  return { articles, loading, error, lastRefreshed, refetch }
}
