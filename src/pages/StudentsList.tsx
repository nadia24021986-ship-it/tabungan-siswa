import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, ChevronRight, UserX } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { listStudents, createStudent, updateStudent, deleteStudent, translateStudentError } from '@/services/students'
import { formatCurrency } from '@/utils/format'
import StudentFormModal from '@/components/StudentFormModal'
import type { Student } from '@/types'

export default function StudentsList() {
  const navigate = useNavigate()
  const { teacher } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Student | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function reload() {
    if (!teacher) return
    setLoading(true)
    const data = await listStudents(teacher.id)
    setStudents(data)
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher?.id])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q)
    )
  }, [students, query])

  async function handleSubmit(data: {
    nis: string
    nisn: string
    studentName: string
    parentName: string
    parentPhone: string
    academicYear: string
    isActive: boolean
  }) {
    if (!teacher) return
    try {
      if (editTarget) {
        await updateStudent(editTarget.id, data)
      } else {
        await createStudent({ teacherId: teacher.id, ...data })
      }
      await reload()
    } catch (err) {
      throw new Error(translateStudentError(err))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteStudent(deleteTarget.id)
      setDeleteTarget(null)
      await reload()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 dark:text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">Data Siswa</h1>
        </div>
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, NIS, atau NISN..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {query ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/siswa-detail/${s.id}`)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{s.studentName}</p>
                    {!s.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">NIS {s.nis} · NISN {s.nisn}</p>
                  <p className="text-sm font-medium text-success-700 dark:text-success-400 mt-1">
                    {formatCurrency(s.balance)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setEditTarget(null)
          setShowForm(true)
        }}
        className="fixed bottom-6 right-6 bg-primary-700 hover:bg-primary-800 text-white rounded-full p-4 shadow-lg"
        aria-label="Tambah Siswa"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showForm && teacher && (
        <StudentFormModal
          initial={editTarget}
          defaultAcademicYear={teacher.academicYear}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Hapus Siswa?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Data <strong>{deleteTarget.studentName}</strong> beserta seluruh riwayat transaksinya akan terhapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl py-2.5"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

