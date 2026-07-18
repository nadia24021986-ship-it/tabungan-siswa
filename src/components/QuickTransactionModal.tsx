import { useEffect, useMemo, useState } from 'react'
import { X, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { listStudents } from '@/services/students'
import { createTransaction, translateFunctionError } from '@/services/functions'
import { formatCurrency } from '@/utils/format'
import type { Student, TransactionType } from '@/types'

interface Props {
  preselectedStudent?: Student
  onClose: () => void
  onSuccess: () => void
}

export default function QuickTransactionModal({ preselectedStudent, onClose, onSuccess }: Props) {
  const { teacher } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Student | null>(preselectedStudent ?? null)
  const [type, setType] = useState<TransactionType>('setoran')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!teacher || preselectedStudent) return
    listStudents(teacher.id).then((data) => setStudents(data.filter((s) => s.isActive)))
  }, [teacher, preselectedStudent])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) => s.studentName.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q)
    )
  }, [students, query])

  async function handleSave() {
    if (!selected) {
      setError('Pilih siswa terlebih dahulu.')
      return
    }
    const numAmount = Number(amount.replace(/\D/g, ''))
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal yang valid.')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await createTransaction({ studentId: selected.id, type, amount: numAmount, note })
      setSuccess(`Tersimpan: ${res.transactionNumber} — Saldo baru ${formatCurrency(res.newBalance)}`)
      setAmount('')
      setNote('')
      onSuccess()
      // Kalau dipanggil dari list siswa (belum ada preselected), reset
      // pilihan siswa supaya guru bisa lanjut input siswa berikutnya
      // dengan cepat tanpa tutup modal.
      if (!preselectedStudent) {
        setSelected(null)
        setQuery('')
      }
    } catch (err) {
      setError(translateFunctionError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white">Transaksi Cepat</h2>
          <button onClick={onClose} className="text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-3 py-2">{error}</div>
          )}
          {success && (
            <div className="bg-success-50 dark:bg-success-950 text-success-700 dark:text-success-400 text-sm rounded-lg px-3 py-2">{success}</div>
          )}

          {!preselectedStudent && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Pilih Siswa</label>
              {selected ? (
                <div className="flex items-center justify-between bg-primary-50 dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-xl px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.studentName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">NIS {selected.nis}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                    Ganti
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ketik nama, NIS, atau NISN..."
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filtered.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{s.studentName}</span>{' '}
                        <span className="text-gray-400">NIS {s.nis}</span>
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-3">Siswa tidak ditemukan</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nominal</label>
            <input
              inputMode="numeric"
              value={amount ? Number(amount.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jenis Transaksi</label>
            <div className="grid grid-cols-3 gap-2">
              {(['setoran', 'penarikan', 'koreksi'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2.5 rounded-xl text-sm font-medium capitalize border ${
                    type === t
                      ? t === 'setoran'
                        ? 'bg-success-600 border-success-600 text-white'
                        : t === 'penarikan'
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-amber-500 border-amber-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Catatan (opsional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan transaksi"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>
  )
}

