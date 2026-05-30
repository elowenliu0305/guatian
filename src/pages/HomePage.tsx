import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MelonCard from '../components/MelonCard'
import { mockMelons } from '../stores/melonStore'
import { getMelons } from '../services/api'
import { useUserStore } from '../stores/userStore'

const tabs = ['全部', '即时瓜条', '上古瓜条', '我创建的']

interface MelonItem {
  id: string;
  title: string;
  description: string;
  category: '即时瓜条' | '上古瓜条';
  status: 'live' | 'dying' | 'dead' | 'revived';
  onlineCount: number;
  lastEdited: string;
  retentionTotal: number;
  retentionRemaining: number;
  heatScore: number;
  creator: string;
  historicalHeat?: number;
  deathDate?: string;
  revivalCount?: number;
}

function transformApiMelon(m: any): MelonItem {
  const statusMap: Record<string, 'live' | 'dying' | 'dead' | 'revived'> = {
    active: 'live',
    dying: 'dying',
    dead: 'dead',
    revived: 'revived',
  }
  return {
    id: m.id,
    title: m.title,
    description: m.description || '',
    category: m.status === 'dead' || m.status === 'revived' ? '上古瓜条' : '即时瓜条',
    status: statusMap[m.status] || 'live',
    onlineCount: Math.floor(Math.random() * 3000) + 100,
    lastEdited: '刚刚',
    retentionTotal: m.retention_seconds || 86400,
    retentionRemaining: m.retention_seconds || 86400,
    heatScore: m.heat_score || 0,
    creator: '猹友',
    historicalHeat: m.heat_score || 0,
    revivalCount: m.revivals_count || 0,
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const { userId } = useUserStore()
  const [activeTab, setActiveTab] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [hotOnly, setHotOnly] = useState(false)
  const [melons, setMelons] = useState<MelonItem[]>(mockMelons)
  const [loading, setLoading] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  // Fetch melons from API
  useEffect(() => {
    const fetchMelons = async () => {
      try {
        const data = await getMelons()
        if (data && data.length > 0) {
          setMelons(data.map(transformApiMelon))
        }
      } catch (e) {
        console.warn('Failed to fetch melons, using mock data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchMelons()
  }, [])

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [showSearch])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false)
      }
    }
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [showMoreMenu])

  const filtered = melons
    .filter((m) => {
      if (activeTab === 1) return m.category === '即时瓜条'
      if (activeTab === 2) return m.category === '上古瓜条'
      if (activeTab === 3) return m.creator === 'momo'
      return true
    })
    .filter((m) =>
      !searchQuery || m.title.includes(searchQuery) || m.description.includes(searchQuery)
    )
    .filter((m) => !hotOnly || m.heatScore > 50000)

  const recentMelons = melons.slice(0, 3)

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">瓜田</h1>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              🟢 在线 1.2w
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`text-lg transition-colors ${showSearch ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              🔍
            </button>
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ⋯
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px] z-20 animate-fade-in">
                  <button
                    onClick={() => { setHotOnly(false); setShowMoreMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    {!hotOnly ? '✅ ' : '  '} 显示全部
                  </button>
                  <button
                    onClick={() => { setHotOnly(true); setShowMoreMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    {hotOnly ? '✅ ' : '  '} 🔥 只看热瓜
                  </button>
                  <div className="border-t border-gray-50 my-1" />
                  <button
                    onClick={() => { setShowMoreMenu(false); window.location.reload() }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    🔄 刷新
                  </button>
                  <button
                    onClick={() => { setShowMoreMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    📋 社区公约
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showSearch && (
          <div className="mt-2 animate-fade-in">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">🔍</span>
              <input
                ref={searchRef}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                placeholder="搜索瓜条标题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 pt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {!searchQuery && recentMelons.length > 0 && (
              <div className="px-4 pt-3 pb-2">
                <h2 className="text-xs text-gray-400 mb-2 font-medium">最近访问</h2>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {recentMelons.map((melon) => (
                    <div
                      key={melon.id}
                      className="flex-shrink-0 w-36 bg-white rounded-lg border border-gray-100 p-3 cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => navigate(`/melon/${melon.id}`)}
                    >
                      <p className="text-sm font-medium text-gray-700 line-clamp-2 mb-1">{melon.title}</p>
                      <p className="text-xs text-gray-400">👥 {melon.onlineCount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searchQuery && (
              <div className="px-4 pt-1 pb-2">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        activeTab === i
                          ? 'bg-white text-green-700 font-medium shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && (
              <div className="px-4 pt-2 pb-1">
                <p className="text-xs text-gray-400">
                  搜索 "{searchQuery}" 共 {filtered.length} 个结果
                </p>
              </div>
            )}

            {hotOnly && !searchQuery && (
              <div className="px-4 pb-1">
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  🔥 只看热瓜
                </span>
              </div>
            )}

            <div className="px-4 pb-4 space-y-3">
              {filtered.length > 0 ? (
                filtered.map((melon) => (
                  <MelonCard key={melon.id} melon={melon} />
                ))
              ) : (
                <div className="text-center pt-12 text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm">
                    {searchQuery ? `没有找到"${searchQuery}"相关瓜条` : '还没有瓜条，去开一个吧'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-xs text-green-600 underline"
                    >
                      清除搜索
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
