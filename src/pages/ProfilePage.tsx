import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { nickname, avatar, logout } = useUserStore()
  const [showTitleEdit, setShowTitleEdit] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [toast, setToast] = useState('')

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
              <p className="text-xs text-gray-400 mt-0.5">bb友 ID: {useUserStore.getState().userId?.slice(0, 8) || '10086'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-50">
            {[
              { label: '创建', value: '12' },
              { label: '参与', value: '23' },
              { label: '获赞', value: '2.3k' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My topics */}
        <div className="bg-white mx-4 mt-3 rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-700">我创建的话题</h3>
            <span className="text-xs text-gray-400">(3)</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">还没有创建话题，去画布上开一个吧</p>

          <div className="border-t border-gray-50 pt-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-700">我参与的话题</h3>
              <span className="text-xs text-gray-400">(12)</span>
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
