import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import HotPage from './pages/HotPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'
import { useUserStore } from './stores/userStore'

function AppContent() {
  const { isLoggedIn, initFromStorage } = useUserStore()
  const location = useLocation()
  const [createTopicDraft, setCreateTopicDraft] = useState('')
  const [inTopicDetail, setInTopicDetail] = useState(false)
  const showNav = isLoggedIn

  // Check localStorage on mount
  useEffect(() => {
    initFromStorage()
  }, [initFromStorage])

  if (!isLoggedIn) {
    return (
      <div className="h-full flex flex-col max-w-md mx-auto bg-white relative">
        <LoginPage />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-md mx-auto bg-white relative">
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage createTopicDraft={createTopicDraft} onDraftConsumed={() => setCreateTopicDraft('')} onTopicDetailChange={setInTopicDetail} />} />
          <Route path="/hot" element={<HotPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {showNav && location.pathname === '/' && !inTopicDetail && <BottomNav onSendMessage={setCreateTopicDraft} placeholder="创建新话题..." />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
