import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { listLicenseKeys, generateLicenseKeys, type LicenseKeyRow } from '@/services/admin'
import { formatDate } from '@/utils/format'

export default function AdminLicenses() {
  const navigate = useNavigate()
  const [keys, setKeys] = useState<LicenseKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [count, setCount] = useState(1)
  const [duration, setDuration] = useState(365)
  const [isPermanent, setIsPermanent] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')

  async function reload() {
    setLoading(true)
    setError('')
    try {
      const data = await listLicenseKeys()
      setKeys(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      await generateLicenseKeys(count, isPermanent ? 0 : duration)
      await reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 1500)
  }

  const available = keys.filter((k) => !k.is_used)
  const used = keys.filter((k) => k.is_used)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 dark:text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">Kelola Lisensi</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Generate Kunci Baru</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jumlah</label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Durasi (hari)</label>
              <input
                type="number"
                min={30}
                value={isPermanent ? '' : duration}
                disabled={isPermanent}
                placeholder={isPermanent ? 'Selamanya' : ''}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isPermanent}
              onChange={(e) => setIsPermanent(e.target.checked)}
              className="rounded"
            />
            Lisensi Permanen (tanpa batas waktu)
          </label>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm"
          >
            {generating ? 'Membuat...' : `Generate ${count} Kunci`}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                Kunci Tersedia ({available.length})
              </h2>
              <div className="space-y-2">
                {available.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Belum ada kunci tersedia</p>
                ) : (
                  available.map((k) => (
                    <div key={k.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono font-semibold text-gray-900 dark:text-white text-sm">{k.activation_key}</p>
                        <p className="text-xs text-gray-400">
                          {k.duration_days === 0 ? 'Selamanya' : `${k.duration_days} hari`} · dibuat {formatDate(k.created_at)}
                        </p>
                      </div>
                      <button onClick={() => copyKey(k.activation_key)} className="text-primary-700 dark:text-primary-400">
                        {copiedKey === k.activation_key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                Sudah Terpakai ({used.length})
              </h2>
              <div className="space-y-2">
                {used.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Belum ada yang terpakai</p>
                ) : (
                  used.map((k) => (
                    <div key={k.id} className="bg-gray-100 dark:bg-gray-900 rounded-xl p-3 opacity-70">
                      <p className="font-mono font-semibold text-gray-600 dark:text-gray-400 text-sm">{k.activation_key}</p>
                      <p className="text-xs text-gray-400">
                        Dipakai {k.used_at ? formatDate(k.used_at) : '-'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

