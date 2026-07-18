import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Student } from '@/types'

interface Props {
  initial?: Student | null
  defaultAcademicYear: string
  onClose: () => void
  onSubmit: (data: {
    nis: string
    nisn: string
    studentName: string
    parentName: string
    parentPhone: string
    academicYear: string
    isActive: boolean
  }) => Promise<void>
}

export default function StudentFormModal({ initial, defaultAcademicYear, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    nis: initial?.nis ?? '',
    nisn: initial?.nisn ?? '',
    studentName: initial?.studentName ?? '',
    parentName: initial?.parentName ?? '',
    parentPhone: initial?.parentPhone ?? '',
    academicYear: initial?.academicYear ?? defaultAcademicYear,
    isActive: initial?.isActive ?? true
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm'
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {initial ? 'Edit Siswa' : 'Tambah Siswa'}
          </h2>
          <button onClick={onClose} className="text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>NIS</label>
              <input required value={form.nis} onChange={(e) => update('nis', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NISN</label>
              <input required value={form.nisn} onChange={(e) => update('nisn', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nama Siswa</label>
            <input required value={form.studentName} onChange={(e) => update('studentName', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Nama Orang Tua</label>
            <input value={form.parentName} onChange={(e) => update('parentName', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Nomor HP Orang Tua</label>
            <input value={form.parentPhone} onChange={(e) => update('parentPhone', e.target.value)} placeholder="08xxxxxxxxxx" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Tahun Ajaran</label>
            <input required value={form.academicYear} onChange={(e) => update('academicYear', e.target.value)} className={inputClass} />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pt-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
              className="rounded"
            />
            Siswa Aktif
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl py-2.5"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

