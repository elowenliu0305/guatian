import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockMelons } from '../stores/melonStore'

export default function HotPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'hot' | 'ancient'>('hot')

  const hotList = [...mockMelons]
    .filter(m => m.status !== 'dead')
    .sort((a, b) => b.heatScore - a.heatScore)

  const ancientList = [...mockMelons]
    .filter(m => m.category === '上古瓜条')
    .sort((a, b) => (b.historicalHeat || b.heatScore) - (a.historicalHeat || a.heatScore))

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return ''
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => navigate('/')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-800">最好吃的瓜</h1>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">每分钟自动刷新</span>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['hot', 'ancient'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                tab === t
                  ? 'bg-white text-green-700 font-medium shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'hot' ? '🔥 实时榜' : '🏛️ 上古榜'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-2">
        {tab === 'hot' && hotList.map((melon, i) => (
          <div
            key={melon.id}
            className="bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/melon/${melon.id}`)}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold w-6 text-center ${
                i === 0 ? 'text-red-500' : i === 1 ? 'text-orange-500' : i === 2 ? 'text-yellow-600' : 'text-gray-300'
              }`}>
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{melon.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>🔥 热度 {(melon.heatScore / 1000).toFixed(1)}w</span>
                  <span>👥 {melon.onlineCount}</span>
                  <span>🕐 {melon.lastEdited}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {melon.retentionRemaining > 0 && (
                  <span className={`text-xs font-mono ${melon.status === 'dying' ? 'text-red-500' : 'text-gray-500'}`}>
                    ⏳{formatTime(melon.retentionRemaining)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2 ml-9">
              <button
                className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium"
                onClick={(e) => { e.stopPropagation(); navigate(`/melon/${melon.id}`) }}
              >
                进入
              </button>
              <button
                className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                🍉 打赏
              </button>
            </div>
          </div>
        ))}

        {tab === 'ancient' && ancientList.map((melon, i) => (
          <div
            key={melon.id}
            className="bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50 cursor-pointer"
            onClick={() => navigate(melon.status === 'dead' ? `/melon/${melon.id}/dead` : `/melon/${melon.id}`)}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold w-6 text-center text-gray-400">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{melon.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>📊 历史热度 {((melon.historicalHeat || melon.heatScore) / 1000).toFixed(1)}w</span>
                  {melon.revivalCount !== undefined && (
                    <span>🔄 已复活 {melon.revivalCount} 次</span>
                  )}
                  <span>📅 {melon.deathDate || '未知'}</span>
                </div>
              </div>
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                  melon.status === 'revived' ? 'bg-purple-500' : 'bg-gray-500'
                }`}>
                  {melon.status === 'revived' ? '已复活' : '已死亡'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 ml-9">
              <button
                className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium"
                onClick={(e) => { e.stopPropagation(); navigate(melon.status === 'dead' ? `/melon/${melon.id}/dead` : `/melon/${melon.id}`) }}
              >
                {melon.status === 'dead' ? '查看' : '进入'}
              </button>
              {melon.status === 'dead' && (
                <button
                  className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-medium"
                  onClick={(e) => { e.stopPropagation(); navigate(`/melon/${melon.id}/dead`) }}
                >
                  🔨 申请复活
                </button>
              )}
            </div>
          </div>
        ))}

        {tab === 'hot' && hotList.length === 0 && (
          <div className="text-center pt-12 text-gray-400">
            <div className="text-4xl mb-3">🍉</div>
            <p className="text-sm">暂无热门瓜条，快去开一个吧</p>
          </div>
        )}
      </div>
    </div>
  )
}
