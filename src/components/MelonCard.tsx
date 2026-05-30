import { Link } from 'react-router-dom'
import type { MockMelon } from '../stores/melonStore'

interface MelonCardProps {
  melon: MockMelon;
}

export default function MelonCard({ melon }: MelonCardProps) {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return ''
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const getStatusLabel = () => {
    switch (melon.status) {
      case 'live': return melon.retentionRemaining < melon.retentionTotal * 0.1
        ? { text: '即将死亡', color: 'bg-red-500' }
        : { text: '限时瓜', color: 'bg-green-500' }
      case 'dying': return { text: '即将死亡', color: 'bg-red-500 animate-pulse' }
      case 'dead': return { text: '已上古', color: 'bg-gray-500' }
      case 'revived': return { text: '已复活', color: 'bg-purple-500' }
    }
  }

  const status = getStatusLabel()
  const isDying = melon.status === 'dying' || (melon.status === 'live' && melon.retentionRemaining < melon.retentionTotal * 0.1)

  return (
    <Link
      to={melon.status === 'dead' ? `/melon/${melon.id}/dead` : `/melon/${melon.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow active:bg-gray-50"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-base leading-tight flex-1 mr-2">
          {melon.title}
        </h3>
        <span className={`flex-shrink-0 text-xs text-white px-2 py-0.5 rounded-full ${status.color}`}>
          {status.text}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-3 line-clamp-1">{melon.description}</p>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>👥 {melon.onlineCount.toLocaleString()} 在线</span>
        <span>🕐 {melon.lastEdited}</span>
      </div>

      {melon.retentionRemaining > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-xs font-mono ${isDying ? 'text-red-500' : 'text-gray-500'}`}>
            ⏳ 剩余 {formatTime(melon.retentionRemaining)}
          </span>
          {isDying && (
            <span className="text-xs text-red-500">⚠️ 即将死亡</span>
          )}
        </div>
      )}

      {melon.status === 'dead' && melon.historicalHeat && (
        <div className="mt-2 text-xs text-gray-400">
          历史热度 {melon.historicalHeat.toLocaleString()} · 死亡于 {melon.deathDate}
        </div>
      )}

      {melon.status === 'revived' && melon.revivalCount && (
        <div className="mt-2 text-xs text-purple-400">
          已复活 {melon.revivalCount} 次
        </div>
      )}
    </Link>
  )
}
