import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginAnonymous, loginEmail, signUpEmail, loading } = useUserStore()

  const [tab, setTab] = useState<'anonymous' | 'email'>('anonymous')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const handleAnonymous = async () => {
    await loginAnonymous()
    navigate('/')
  }

  const handleEmailSubmit = async () => {
    setError('')
    if (!email.trim()) { setError('请输入邮箱'); return }
    if (password.length < 6) { setError('密码至少 6 位'); return }

    const errMsg = isSignUp
      ? await signUpEmail(email.trim(), password)
      : await loginEmail(email.trim(), password)

    if (errMsg) {
      setError(errMsg)
    } else {
      navigate('/')
    }
  }

  const [showEmail, setShowEmail] = useState(false)

  return (
    <div className="h-full flex flex-col bg-[#f5f0e0] relative overflow-hidden">
      {/* Decorative top leaves */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#4a7a3a] to-[#5a8a4a] rounded-b-[100%]" />

      {!showEmail ? (
        /* === Default: anonymous entry view === */
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Logo title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex flex-col items-center">
              <span className="text-6xl leading-none bg-gradient-to-b from-[#2d5a2d] to-[#5a8a3a] bg-clip-text text-transparent"
                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>
                瓜
              </span>
              <div className="w-8 h-0.5 bg-gradient-to-r from-[#2d5a2d] to-[#5a8a3a] my-1 rounded-full" />
              <span className="text-6xl leading-none bg-gradient-to-b from-[#5a8a3a] to-[#428844] bg-clip-text text-transparent"
                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>
                田
              </span>
            </div>
            <div className="w-px h-16 bg-gray-300" />
            <div className="text-xs text-gray-500 leading-relaxed tracking-wider">
              上古瓜条<br />限时瓜田<br />实时开聊<br />截图留存
            </div>
          </div>

          {/* Mascot */}
          <div className="mb-10">
            <img src="/mascot.png" alt="瓜田" className="w-48 h-48 object-contain" />
          </div>

          {/* Green button */}
          <button
            onClick={handleAnonymous}
            disabled={loading}
            className="w-full max-w-sm py-4 rounded-2xl bg-[#428844] text-white text-lg font-bold shadow-lg hover:bg-[#3a783e] active:bg-[#326835] transition-colors disabled:opacity-50 tracking-wide"
          >
            {loading ? '正在进入...' : '匿名猹友进入'}
          </button>

          <button
            onClick={() => setShowEmail(true)}
            className="w-full max-w-sm py-4 rounded-2xl border-2 border-[#428844] text-[#428844] text-lg font-bold hover:bg-[#428844]/5 active:bg-[#428844]/10 transition-colors mt-3 tracking-wide"
          >
            使用邮箱登录 / 注册
          </button>
        </div>
      ) : (
        /* === Email login/signup view === */
        <div className="flex-1 flex flex-col justify-center px-8 -mt-12">
          <button onClick={() => setShowEmail(false)} className="text-gray-500 text-sm self-start mb-4">
            ← 返回
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {isSignUp ? '注册新账号' : '邮箱登录'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {isSignUp ? '用邮箱注册瓜田账号' : '使用邮箱和密码登录'}
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">邮箱</label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#428844] focus:border-transparent bg-white"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">密码</label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#428844] focus:border-transparent bg-white"
                type="password"
                placeholder="至少 6 位密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#428844] text-white font-medium text-base hover:bg-[#3a783e] active:bg-[#326835] transition-colors disabled:opacity-50 shadow-lg"
            >
              {loading ? '处理中...' : (isSignUp ? '注册并进入' : '登录')}
            </button>
          </div>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="text-xs text-[#428844] mt-4 text-center"
          >
            {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      )}

      {/* Footer */}
      {!showEmail && (
        <div className="px-8 pb-6">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            进入瓜田即表示你同意
            <br />
            <span className="text-gray-500 underline">《瓜田社区公约》</span>
          </p>
        </div>
      )}
    </div>
  )
}
