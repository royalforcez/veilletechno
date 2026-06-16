import { NavLink } from 'react-router-dom'

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-base tracking-tight">Post-VMware</span>
          <span className="text-gray-300 text-sm hidden sm:inline">—</span>
          <span className="text-gray-500 text-sm hidden sm:inline">Veille technologique</span>
        </div>

        <div className="flex gap-1 ml-2">
          <NavLink to="/" end className={linkClass}>
            Tous les articles
          </NavLink>
          <NavLink to="/top" className={linkClass}>
            Top articles
          </NavLink>
        </div>

        {IS_MOCK && (
          <span className="ml-auto text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-medium">
            Données mock
          </span>
        )}
      </div>
    </nav>
  )
}
