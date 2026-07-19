import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import VideoIntro from '@/components/VideoIntro'
import Login from '@/pages/Login'
import RegisterTeacher from '@/pages/RegisterTeacher'
import TeacherDashboard from '@/pages/TeacherDashboard'
import StudentDashboard from '@/pages/StudentDashboard'
import LicenseActivation from '@/pages/LicenseActivation'
import StudentsList from '@/pages/StudentsList'
import StudentDetail from '@/pages/StudentDetail'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import AdminLicenses from '@/pages/AdminLicenses'
import WelcomeScreen from '@/pages/WelcomeScreen'

function HomeRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />
  return <Navigate to={profile.role === 'teacher' ? '/dashboard' : '/siswa'} replace />
}

/** Sinkronkan class "dark" di <html> dengan preferensi tema guru */
function ThemeSync() {
  const { teacher } = useAuth()
  useEffect(() => {
    const root = document.documentElement
    if (teacher?.theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [teacher?.theme])
  return null
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeSync />
        {showSplash && (
          <VideoIntro
            src="/videos/splash.mp4"
            durationMs={2000}
            onFinish={() => setShowSplash(false)}
          />
        )}
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<RegisterTeacher />} />
          <Route path="/selamat-datang" element={<WelcomeScreen />} />
          <Route
            path="/aktivasi-lisensi"
            element={
              <ProtectedRoute allowedRole="teacher">
                <LicenseActivation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-siswa"
            element={
              <ProtectedRoute allowedRole="teacher">
                <StudentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa-detail/:id"
            element={
              <ProtectedRoute allowedRole="teacher">
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan"
            element={
              <ProtectedRoute allowedRole="teacher">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaturan"
            element={
              <ProtectedRoute allowedRole="teacher">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-lisensi"
            element={
              <ProtectedRoute allowedRole="teacher">
                <AdminLicenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/siswa"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
