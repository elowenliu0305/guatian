import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()

  const tabs = [
    { path: '/', label: '瓜田', icon: '🏠' },
    { path: '/hot', label: '热门瓜榜', icon: '🔥' },
    { path: '/create', label: '开瓜', icon: '➕' },
    { path: '/profile', label: '我的', icon: '👤' },
  ]

  return (
    <nav className="flex-shrink-0 flex items-center justify-around bg-white border-t border-gray-100 px-2 py-1.5">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
