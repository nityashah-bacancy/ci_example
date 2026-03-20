import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { Loader, Loader2 } from "lucide-react"
import { Toaster } from "react-hot-toast"

const App = () => {
  const { checkAuth, authUser, isCheckingAuth, onlineUsers } = useAuthStore(); // initially isCheckingAuth aa true che, jyare data aavse tyare set to false thse
  const { theme } = useThemeStore();
  console.log({ onlineUsers });
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        {/* // aa badha thi routes protect karya che */}
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App