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
  const { authUser, profile, license, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authUser || !profile) {
    return <Navigate to="/login" replace />
  }

  if (profile.role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  if (allowedRole === 'teacher' && license) {
    const isExpired =
      license.status === 'expired' ||
      (license.status === 'trial' && new Date(license.trialEnd).getTime() < Date.now())
    if (isExpired) {
      return <Navigate to="/aktivasi-lisensi" replace />
    }
  }

  return <>{children}</>
}

