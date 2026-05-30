import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMelon } from '../services/api'
import { useUserStore } from '../stores/userStore'

const RETENTION_OPTIONS = [
  { label: '1 小时', value: 3600 },
  { label: '6 小时', value: 21600 },
  { label: '24 小时', value: 86400, default: true },
  { label: '3 天', value: 259200 },
  { label: '自定义', value: 0 },
]

export default function CreateMelon() {
  const navigate = useNavigate()
  const { userId } = useUserStore()
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [retention, setRetention] = useState(86400)
  const [isCustom, setIsCustom] = useState(false)
  const [customHours, setCustomHours] = useState('')
  const [isLimited, setIsLimited] = useState(true)
  const [allowRevival, setAllowRevival] = useState(true)
  const [allowImage, setAllowImage] = useState(true)
  const [errors, setErrors] = useState<{ title?: string; retention?: string }>({})

  const handleSubmit = async () => {
    const newErrors: { title?: string; retention?: string } = {}
    if (!title.trim()) newErrors.title = '请输入瓜条标题'
    if (isCustom && !customHours) newErrors.retention = '请输入留存时间'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setCreating(true)
    try {
      const finalRetention = isCustom ? parseInt(customHours) * 3600 : retention
      const melon = await createMelon({
        title: title.trim(),
        description: description.trim(),
        creator_id: userId || '00000000-0000-0000-0000-000000000001',
        retention_seconds: finalRetention,
        is_time_limited: isLimited,
        allow_revival: allowRevival,
        allow_images: allowImage,
      })
      navigate(`/melon/${melon.id}`)
    } catch (e) {
      console.warn('Failed to create melon via API, using mock:', e)
      alert(`瓜条"${title}"创建成功！（Mock）`)
      navigate('/')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-800">开瓜</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">瓜条标题</label>
          <input
            className={`w-full px-3 py-2.5 rounded-lg border ${errors.title ? 'border-red-300' : 'border-gray-200'} text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="例：今天你吃瓜了吗"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors({}) }}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">瓜条简介</label>
          <textarea
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="描述一下你的瓜案..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Retention */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">留存时间</label>
          <div className="grid grid-cols-5 gap-2">
            {RETENTION_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setRetention(opt.value)
                  setIsCustom(opt.value === 0)
                  setErrors({})
                }}
                className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                  !isCustom && retention === opt.value
                    ? 'bg-green-500 text-white'
                    : isCustom && opt.value === 0
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {isCustom && (
            <div className="mt-2">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="输入小时数"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
              />
              {errors.retention && <p className="text-xs text-red-500 mt-1">{errors.retention}</p>}
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <ToggleOption label="限时（到期后锁定）" checked={isLimited} onChange={setIsLimited} />
          <ToggleOption label="允许复活申请" checked={allowRevival} onChange={setAllowRevival} />
          <ToggleOption label="允许插入图片" checked={allowImage} onChange={setAllowImage} />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-green-500 text-white font-medium text-base hover:bg-green-600 active:bg-green-700 transition-colors shadow-sm"
        >
          {creating ? '创建中...' : '创建瓜条'}
        </button>
      </div>
    </div>
  )
}

function ToggleOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${
          checked ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } shadow-sm`} />
      </button>
    </div>
  )
}
