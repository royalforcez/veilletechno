export interface Article {
  id: number
  titre: string
  source: string
  date: string    // ISO 8601
  lien: string
  resume: string
  score: number   // 0.0 – 1.0
  is_top?: boolean
  tags?: string[]
}
