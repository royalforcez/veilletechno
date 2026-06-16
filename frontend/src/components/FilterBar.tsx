export type SortKey = 'score' | 'date_desc' | 'date_asc' | 'source'

export interface Filters {
  search: string
  sortKey: SortKey
  scoreMin: number
  activeTags: string[]
  activeSources: string[]
}

interface FilterBarProps {
  filters: Filters
  allTags: string[]
  allSources: string[]
  onChange: (f: Filters) => void
}

export default function FilterBar({ filters, allTags, allSources, onChange }: FilterBarProps) {
  const set = (partial: Partial<Filters>) => onChange({ ...filters, ...partial })

  function toggleTag(tag: string) {
    const next = filters.activeTags.includes(tag)
      ? filters.activeTags.filter((t) => t !== tag)
      : [...filters.activeTags, tag]
    set({ activeTags: next })
  }

  function toggleSource(source: string) {
    const next = filters.activeSources.includes(source)
      ? filters.activeSources.filter((s) => s !== source)
      : [...filters.activeSources, source]
    set({ activeSources: next })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col gap-4">
      {/* Recherche */}
      <input
        type="search"
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
        placeholder="Rechercher dans les titres et résumés..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
      />

      {/* Tri + score min */}
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Trier par</span>
          <select
            value={filters.sortKey}
            onChange={(e) => set({ sortKey: e.target.value as SortKey })}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="score">Score ↓</option>
            <option value="date_desc">Date ↓ (récent)</option>
            <option value="date_asc">Date ↑ (ancien)</option>
            <option value="source">Source A→Z</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600 flex-1 min-w-[200px]">
          <span className="font-medium whitespace-nowrap">Score min.</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(filters.scoreMin * 100)}
            onChange={(e) => set({ scoreMin: Number(e.target.value) / 100 })}
            className="flex-1 accent-blue-600"
          />
          <span className="w-8 text-right font-mono text-gray-700 tabular-nums">
            {Math.round(filters.scoreMin * 100)}%
          </span>
        </label>
      </div>

      {/* Filtre par source */}
      {allSources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-500 font-medium mr-1">Sources :</span>
          {allSources.map((source) => {
            const active = filters.activeSources.includes(source)
            return (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {source}
              </button>
            )
          })}
          {filters.activeSources.length > 0 && (
            <button
              onClick={() => set({ activeSources: [] })}
              className="text-xs text-gray-400 hover:text-red-500 ml-1 transition-colors"
            >
              effacer
            </button>
          )}
        </div>
      )}

      {/* Filtre par tag */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-500 font-medium mr-1">Tags :</span>
          {allTags.map((tag) => {
            const active = filters.activeTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {tag}
              </button>
            )
          })}
          {filters.activeTags.length > 0 && (
            <button
              onClick={() => set({ activeTags: [] })}
              className="text-xs text-gray-400 hover:text-red-500 ml-1 transition-colors"
            >
              effacer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
