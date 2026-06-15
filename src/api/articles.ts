import type { Article } from '../types/article'
import mockData from '../data/mock-articles.json'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !API_BASE

export async function fetchArticles(): Promise<Article[]> {
  if (USE_MOCK) {
    return mockData as Article[]
  }
  const res = await fetch(`${API_BASE}/articles`)
  if (!res.ok) throw new Error(`Erreur API ${res.status}`)
  return res.json() as Promise<Article[]>
}
