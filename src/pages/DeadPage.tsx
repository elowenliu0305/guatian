import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockMelons } from '../stores/melonStore'
import { useUserStore } from '../stores/userStore'
import { createRevivalRequest } from '../services/api'

const DURATIONS = [
  { label: '1 小时', value: 3600 },
  { label: '6 小时', value: 21600 },
  { label: '24 小时', value: 86400 },
  { label: '3 天', value: 259200 },
]

export default function DeadPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userId } = useUserStore()
  const melon = mockMelons.find(m => m.id === id)

  const [showRevival, setShowRevival] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(86400)
  const [reviving, setReviving] = useState(false)
  const [revived, setRevived] = useState(false)
  const [toast, setToast] = useState('')

  if (!melon) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        瓜条不存在
      </div>
    )
  }

  const handleRevival = async () => {
    setReviving(true)
    try {
      if (id) {
        await createRevivalRequest(id, userId || 'anonymous', selectedDuration)
      }
      setRevived(true)
      setShowRevival(false)
      setToast('复活申请已提交！')
    } catch (e) {
      console.warn('Revival request failed:', e)
      setRevived(true)
      setShowRevival(false)
      setToast('复活申请已提交！（Mock）')
    } finally {
      setReviving(false)
      setTimeout(() => setToast(''), 2500)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 items-center justify-center px-8">
      <div className="absolute top-0 left-0 right-0 bg-white px-4 pt-3 pb-2 border-b border-gray-100">
        <button onClick={() => navigate('/')} className="text-gray-500 text-lg">←</button>
      </div>

      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🪦</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">瓜条已上古</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          该瓜条已过留存时间<br />
          当前无法继续编辑
        </p>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">开创者</span>
            <span className="text-gray-700">{melon.creator}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">上古时间</span>
            <span className="text-gray-700">{melon.deathDate || '2024-01-15'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">历史热度</span>
            <span className="text-gray-700 font-medium">{(melon.historicalHeat || melon.heatScore).toLocaleString()}</span>
          </div>
          {revived && (
            <div className="border-t border-green-100 pt-2 mt-2">
              <div className="text-sm text-green-600 font-medium text-center">✅ 复活申请已提交！等待开创者审批</div>
            </div>
          )}
          {!revived && (
            <div className="border-t border-gray-50 pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">申请复活</span>
                <span className="text-orange-600 font-medium">521 人</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">瓜子</span>
                <span className="text-green-600 font-medium">12,800 / 20,000</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
          )}
        </div>

        {!showRevival && !revived && (
          <div className="space-y-3">
            <button
              onClick={() => setShowRevival(true)}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium text-base hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-sm"
            >
              🔨 申请复活
            </button>
            <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-base hover:bg-gray-50 transition-colors">
              📷 查看历史截图
            </button>
          </div>
        )}

        {showRevival && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">选择复活时长</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDuration(d.value)}
                  className={`py-2 rounded-lg text-sm transition-colors ${
                    selectedDuration === d.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRevival(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleRevival}
                disabled={reviving}
                className="flex-1 py-2 rounded-lg bg-orange-500 text-sm text-white font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {reviving ? '提交中...' : '确认申请'}
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-6 leading-relaxed">
          复活仅恢复讨论现场，不代表瓜田认可全部内容。
          <br />
          截图可以，造谣不行。
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
