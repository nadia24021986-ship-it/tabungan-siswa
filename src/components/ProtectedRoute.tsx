import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

export default function ProtectedRoute({
  children,
  allowedRole
}: {
  children: React.ReactNode
  allowedRole: UserRole
}) {
  const { firebaseUser, profile, license, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!firebaseUser || !profile) {
    return <Navigate to="/login" replace />
  }

  if (profile.role !== allowedRole) {
    // Guru nyasar ke rute siswa atau sebaliknya -> arahkan ke beranda masing-masing
    return <Navigate to="/" replace />
  }

  // Hanya guru yang perlu validasi lisensi (siswa tetap bisa lihat data
  // meski lisensi guru habis, supaya orang tua tetap bisa pantau saldo)
  if (allowedRole === 'teacher' && license) {
    const isExpired =
      license.status === 'expired' ||
      (license.status === 'trial' && license.trialEnd < Date.now())
    if (isExpired) {
      return <Navigate to="/aktivasi-lisensi" replace />
    }
  }

  return <>{children}</>
}

