import { useState } from 'react'
import type { Article } from '../types/article'
import ScoreBadge, { scoreColors } from './ScoreBadge'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isRecent(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 48 * 3600 * 1000
}

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { titre, source, date, lien, resume, score, is_top, tags } = article
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const { border } = scoreColors(score)
  const recent = isRecent(date)
  const longResume = resume.length > 140
  const hasLink = lien && lien !== '#'

  async function copyLink(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(lien)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard non disponible
    }
  }

  function openArticle() {
    if (hasLink) window.open(lien, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={openArticle}
      role={hasLink ? 'link' : undefined}
      tabIndex={hasLink ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasLink && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          openArticle()
        }
      }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${border} p-4 flex flex-col gap-3 hover:shadow-md transition-shadow ${
        hasLink ? 'cursor-pointer' : ''
      }`}
    >
      {/* En-tête : titre + score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {is_top && (
            <span className="shrink-0 mt-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              Top
            </span>
          )}
          {recent && (
            <span className="shrink-0 mt-0.5 flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              Nouveau
            </span>
          )}
          {hasLink ? (
            <a
              href={lien}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
            >
              {titre}
            </a>
          ) : (
            <span className="font-semibold text-gray-900 line-clamp-2 leading-snug">{titre}</span>
          )}
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* Résumé avec expand/collapse */}
      <div>
        <p
          className={`text-gray-500 text-sm leading-relaxed ${!expanded && longResume ? 'line-clamp-2' : ''}`}
        >
          {resume}
        </p>
        {longResume && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
            className="text-xs text-blue-500 hover:text-blue-700 mt-1 transition-colors"
          >
            {expanded ? 'Réduire' : 'Lire la suite'}
          </button>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Pied de carte : source, date, copier */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-500">{source}</span>
          <span>{formatDate(date)}</span>
        </div>
        {hasLink && (
          <button
            onClick={copyLink}
            className="hover:text-gray-600 transition-colors"
            title="Copier le lien"
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        )}
      </div>
    </div>
  )
}
