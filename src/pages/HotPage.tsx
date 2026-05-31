import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockTopics } from '../stores/topicStore'

export default function HotPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'hot' | 'all'>('hot')

  const hotList = [...mockTopics].sort((a, b) => b.heatScore - a.heatScore)

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => navigate('/')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-800">热门榜</h1>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['hot', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                tab === t
                  ? 'bg-white text-green-700 font-medium shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'hot' ? '🔥 热门' : '📋 全部'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-2">
        {hotList.map((topic, i) => (
          <div
            key={topic.id}
            className="bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold w-6 text-center ${
                i === 0 ? 'text-red-500' : i === 1 ? 'text-orange-500' : i === 2 ? 'text-yellow-600' : 'text-gray-300'
              }`}>
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{topic.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>🔥 热度 {topic.heatScore}</span>
                  <span>💬 {topic.noteCount} 条消息</span>
                  <span>👤 {topic.creator}</span>
                </div>
              </div>
              <button
                className="text-xs text-white bg-[#428844] px-3 py-1.5 rounded-full font-medium flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); navigate('/') }}
              >
                去看看
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
