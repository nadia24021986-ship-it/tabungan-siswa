import { useAuth } from '@/context/AuthContext'
import { logout } from '@/services/auth'

export default function StudentDashboard() {
  const { student } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {student?.studentName ?? 'Siswa'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">NIS: {student?.nis}</p>
          </div>
          <button onClick={() => logout()} className="text-sm text-red-600 dark:text-red-400 font-medium">
            Keluar
          </button>
        </div>

        <div className="bg-gradient-to-br from-success-600 to-success-700 rounded-2xl p-6 text-white mb-4">
          <p className="text-success-100 text-sm mb-1">Saldo Saat Ini</p>
          <p className="text-3xl font-bold">
            Rp {(student?.balance ?? 0).toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-primary-50 dark:bg-gray-900 border border-primary-100 dark:border-gray-800 rounded-2xl p-6 text-center">
          <p className="text-primary-800 dark:text-primary-400 font-medium">
            Riwayat transaksi & grafik tabungan menyusul di tahap berikutnya.
          </p>
        </div>
      </div>
    </div>
  )
}
