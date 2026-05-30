import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MelonPage from './pages/MelonPage'
import HotPage from './pages/HotPage'
import ProfilePage from './pages/ProfilePage'
import CreateMelon from './pages/CreateMelon'
import DeadPage from './pages/DeadPage'
import BottomNav from './components/BottomNav'
import { useUserStore } from './stores/userStore'

function AppContent() {
  const { isLoggedIn, initFromStorage } = useUserStore()
  const location = useLocation()
  const showNav = isLoggedIn && location.pathname !== '/login'

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
          <Route path="/" element={<HomePage />} />
          <Route path="/melon/:id" element={<MelonPage />} />
          <Route path="/melon/:id/dead" element={<DeadPage />} />
          <Route path="/hot" element={<HotPage />} />
          <Route path="/create" element={<CreateMelon />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
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
