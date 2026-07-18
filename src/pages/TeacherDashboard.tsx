import { useAuth } from '@/context/AuthContext'
import { logout } from '@/services/auth'

export default function TeacherDashboard() {
  const { teacher, license } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {teacher?.className ?? 'Kelas'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{teacher?.teacherName}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-sm text-red-600 dark:text-red-400 font-medium"
          >
            Keluar
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status Lisensi</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {license?.status ?? 'Memuat...'}
          </p>
        </div>

        <div className="bg-primary-50 dark:bg-gray-900 border border-primary-100 dark:border-gray-800 rounded-2xl p-6 text-center">
          <p className="text-primary-800 dark:text-primary-400 font-medium">
            Dashboard lengkap (saldo, grafik, transaksi cepat) menyusul di tahap berikutnya.
          </p>
        </div>
      </div>
    </div>
  )
}

