import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginAnonymous, loginEmail, signUpEmail, loading } = useUserStore()

  const [tab, setTab] = useState<'main' | 'email'>('main')
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
    if (errMsg) setError(errMsg)
    else navigate('/')
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/5" />
      <div className="absolute top-1/3 -left-20 w-56 h-56 rounded-full bg-blue-400/5" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-600/5" />
      <div className="absolute bottom-1/4 right-8 w-24 h-24 rounded-full bg-blue-500/5" />

      {tab === 'main' ? (
        <>
          {/* Top spacing */}
          <div className="flex-1" />

          {/* Logo & branding */}
          <div className="flex flex-col items-center px-8 relative z-10">
            {/* Chat icon */}
            <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10 border border-blue-400/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="8" cy="12" r="1" fill="white" />
                <circle cx="12" cy="12" r="1" fill="white" />
                <circle cx="16" cy="12" r="1" fill="white" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">得聊</h1>
            <p className="text-blue-300/60 text-sm tracking-wide">让每句话都有回响</p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom card */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl shadow-black/50 relative z-10 border-t border-blue-500/10">
            <button
              onClick={handleAnonymous}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-base font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-50 tracking-wide"
            >
              {loading ? '进入中...' : '随便逛逛'}
            </button>
            <button
              onClick={() => setTab('email')}
              className="w-full py-4 rounded-2xl border border-blue-500/30 text-blue-300 text-base font-bold mt-3 hover:bg-blue-500/10 active:bg-blue-500/20 transition-colors tracking-wide"
            >
              使用邮箱登录
            </button>
            <p className="text-xs text-blue-300/30 text-center mt-6 leading-relaxed">
              进入即表示接受 <span className="text-blue-300/50 underline underline-offset-2">《用户协议》</span>
            </p>
          </div>
        </>
      ) : (
        /* Email login / signup */
        <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
          <button onClick={() => { setTab('main'); setError('') }} className="text-blue-300/60 text-sm self-start mb-6 hover:text-blue-300 transition-colors">
            ← 返回
          </button>

          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-xl border border-blue-500/10">
            <h2 className="text-xl font-bold text-white mb-1">
              {isSignUp ? '注册新账号' : '邮箱登录'}
            </h2>
            <p className="text-sm text-blue-300/50 mb-6">
              {isSignUp ? '用邮箱注册，开始你的表达' : '使用邮箱和密码登录'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-blue-300/40 mb-1.5 block">邮箱</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-blue-500/20 text-sm text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/80"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-blue-300/40 mb-1.5 block">密码</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-blue-500/20 text-sm text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/80"
                  type="password"
                  placeholder="至少 6 位密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>
              )}

              <button
                onClick={handleEmailSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium text-base shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? '处理中...' : (isSignUp ? '注册并进入' : '登录')}
              </button>
            </div>

            <button
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-xs text-blue-400 mt-4 text-center w-full"
            >
              {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
