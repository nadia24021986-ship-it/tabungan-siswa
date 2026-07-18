import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import RegisterTeacher from '@/pages/RegisterTeacher'
import TeacherDashboard from '@/pages/TeacherDashboard'
import StudentDashboard from '@/pages/StudentDashboard'
import LicenseActivation from '@/pages/LicenseActivation'

function HomeRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />
  return <Navigate to={profile.role === 'teacher' ? '/dashboard' : '/siswa'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<RegisterTeacher />} />
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

