import { useState } from 'react'

interface CellInteractionModalProps {
  cellPosition: string;
  cellContent: string;
  cellColor?: string;
  onClose: () => void;
  onTip: () => void;
}

const REACTIONS = [
  { emoji: '👍', label: '赞', count: 128 },
  { emoji: '👎', label: '踩', count: 23 },
  { emoji: '😂', label: '笑', count: 86 },
  { emoji: '🍉', label: '瓜', count: 152 },
  { emoji: '❤️', label: '心', count: 67 },
]

const POSITIVE_LABELS = ['这格保熟', '理性猹发言', '建议置顶', '太真实了']
const NEGATIVE_LABELS = ['没来源', '太武断', '像带节奏', '别急着判']

export default function CellInteractionModal({ cellPosition, cellContent, cellColor, onClose, onTip }: CellInteractionModalProps) {
  const [userReactions, setUserReactions] = useState<Record<string, number>>({})
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'reactions' | 'feedback' | 'flag'>('reactions')

  const toggleReaction = (emoji: string) => {
    setUserReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }))
  }

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Cell preview */}
        <div className="px-5 pb-3 border-b border-gray-50">
          <p className="text-xs text-gray-400 mb-1 font-mono">{cellPosition} 单元格</p>
          <div
            className="p-3 rounded-lg text-sm text-gray-800 leading-relaxed"
            style={{ backgroundColor: cellColor || '#F5F5F5' }}
          >
            {cellContent}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {([
            { key: 'reactions', label: '反应' },
            { key: 'feedback', label: '反馈标签' },
            { key: 'flag', label: '标记' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-5 py-4 max-h-48 overflow-y-auto">
          {activeTab === 'reactions' && (
            <div className="flex flex-wrap gap-3">
              {REACTIONS.map((r) => {
                const userAdded = userReactions[r.emoji] || 0
                const total = r.count + userAdded
                return (
                  <button
                    key={r.emoji}
                    onClick={() => toggleReaction(r.emoji)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-colors ${
                      userAdded > 0
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-xs font-medium">{total}</span>
                  </button>
                )
              })}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">正向</p>
                <div className="flex flex-wrap gap-2">
                  {POSITIVE_LABELS.map((label) => (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedLabels.includes(label)
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-green-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">负向</p>
                <div className="flex flex-wrap gap-2">
                  {NEGATIVE_LABELS.map((label) => (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedLabels.includes(label)
                          ? 'bg-red-50 border-red-300 text-red-600'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flag' && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: '没来源', color: 'text-yellow-600' },
                { label: '疑似造谣', color: 'text-red-600' },
                { label: '涉及隐私', color: 'text-red-600' },
                { label: '引战', color: 'text-orange-600' },
              ].map((flag) => (
                <button
                  key={flag.label}
                  onClick={() => toggleLabel(flag.label)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedLabels.includes(flag.label)
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'
                  }`}
                >
                  {flag.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => { onTip(); onClose() }}
            className="flex-1 py-2.5 rounded-lg bg-green-500 text-sm text-white font-medium hover:bg-green-600"
          >
            🍉 打赏瓜子
          </button>
        </div>
      </div>
    </div>
  )
}
