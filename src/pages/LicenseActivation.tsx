import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/services/auth'

export default function LicenseActivation() {
  const { license } = useAuth()
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    // TODO: panggil Cloud Function "redeemLicenseKey" di tahap berikutnya
    setError('Fitur redeem kunci lisensi akan aktif setelah Cloud Function dipasang.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center px-6 py-12">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-amber-500 rounded-2xl p-3 mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            {license?.status === 'trial' ? 'Masa Trial Anda Sudah Habis' : 'Lisensi Tidak Aktif'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-center">
            Masukkan kunci aktivasi untuk melanjutkan menggunakan Tabungan Siswa Pro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          {error && (
            <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Kunci Aktivasi
            </label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="TSP-XXXX-XXXX"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-center tracking-widest font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3"
          >
            {loading ? 'Memproses...' : 'Aktifkan'}
          </button>
        </form>

        <button
          onClick={() => logout()}
          className="w-full text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Keluar dari akun ini
        </button>
      </div>
    </div>
  )
}

