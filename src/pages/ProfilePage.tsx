import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { nickname, avatar, level, title, guaziBalance, logout } = useUserStore()
  const [showTitleEdit, setShowTitleEdit] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [toast, setToast] = useState('')

  const availableTitles = [
    { name: '上古瓜王', unlocked: true },
    { name: '吃瓜达人', unlocked: true },
    { name: '证据大师', unlocked: true },
    { name: '复活术士', unlocked: false },
    { name: '理性吃瓜人', unlocked: true },
    { name: '保熟鉴定师', unlocked: false },
  ]

  const handleSaveTitle = () => {
    if (customTitle.length < 2 || customTitle.length > 8) {
      setToast('称号长度为 2-8 个字')
      setTimeout(() => setToast(''), 2000)
      return
    }
    setToast(`称号已设为"${customTitle}"`)
    setShowTitleEdit(false)
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-800">我的</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile card */}
        <div className="bg-white mx-4 mt-4 rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center text-2xl shadow-sm">
              🐹
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-800 text-lg">{nickname}</h2>
              <p className="text-xs text-gray-400 mt-0.5">猹友 ID: {useUserStore.getState().userId?.slice(0, 8) || '10086'}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Lv.{level}
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  {title}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowTitleEdit(!showTitleEdit)}
              className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-lg"
            >
              {showTitleEdit ? '完成' : '编辑'}
            </button>
          </div>

          {/* Title editor */}
          {showTitleEdit && (
            <div className="mt-4 pt-4 border-t border-gray-50 animate-fade-in">
              <p className="text-xs text-gray-500 mb-2">自定义称号（2-8 个字）</p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="输入自定义称号..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  maxLength={8}
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-4 py-2 rounded-lg bg-green-500 text-sm text-white font-medium hover:bg-green-600"
                >
                  保存
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-50">
            {[
              { label: '创建', value: '12' },
              { label: '热瓜', value: '5' },
              { label: '瓜子', value: guaziBalance.toString() },
              { label: '点赞', value: '2.3k' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily check-in */}
        <div className="bg-white mx-4 mt-3 rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">每日签到</h3>
              <p className="text-xs text-gray-400 mt-0.5">签到领取瓜子 🍉</p>
            </div>
            <button
              onClick={() => {
                setToast('🍉 签到成功！获得 10 个瓜子')
                setTimeout(() => setToast(''), 2000)
              }}
              className="text-xs bg-green-500 text-white px-4 py-2 rounded-full font-medium hover:bg-green-600"
            >
              签到
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white mx-4 mt-3 rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">成就与 Title</h3>
          <div className="flex flex-wrap gap-2">
            {availableTitles.map((a) => (
              <span
                key={a.name}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  a.unlocked
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                {a.unlocked ? a.name : `🔒 ${a.name}`}
              </span>
            ))}
          </div>
        </div>

        {/* My melons */}
        <div className="bg-white mx-4 my-3 rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-700">我创建的瓜条</h3>
            <span className="text-xs text-gray-400">(3)</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">还没有创建瓜条，去开一个吧</p>

          <div className="border-t border-gray-50 pt-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-700">我参与的瓜条</h3>
              <span className="text-xs text-gray-400">(12)</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">查看全部 →</p>
          </div>

          <div className="border-t border-gray-50 pt-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-700">我的打赏记录</h3>
              <span className="text-xs text-gray-400">🍉 {guaziBalance} 瓜子余额</span>
            </div>
            <p className="text-xs text-gray-500">查看全部 →</p>
          </div>
        </div>

        {/* Logout / Switch account */}
        <div className="mx-4 my-3 space-y-2 pb-6">
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            切换账号
          </button>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="w-full py-3 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
