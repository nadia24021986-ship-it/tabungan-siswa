import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, UserPlus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getStudent, updateStudent, deleteStudent, translateStudentError } from '@/services/students'
import { listStudentTransactions } from '@/services/transactions'
import { createStudentAccount, translateFunctionError } from '@/services/functions'
import { formatCurrency, formatDateTime } from '@/utils/format'
import StudentFormModal from '@/components/StudentFormModal'
import QuickTransactionModal from '@/components/QuickTransactionModal'
import type { Student, Transaction } from '@/types'

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { teacher } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showActivate, setShowActivate] = useState(false)
  const [showQuickTx, setShowQuickTx] = useState(false)
  const [activateEmail, setActivateEmail] = useState('')
  const [activatePassword, setActivatePassword] = useState('')
  const [activateError, setActivateError] = useState('')
  const [activateLoading, setActivateLoading] = useState(false)

  async function reload() {
    if (!id) return
    setLoading(true)
    const [s, tx] = await Promise.all([getStudent(id), listStudentTransactions(id)])
    setStudent(s)
    setTransactions(tx)
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleActivate() {
    if (!student) return
    setActivateError('')
    setActivateLoading(true)
    try {
      await createStudentAccount({ studentId: student.id, email: activateEmail.trim(), password: activatePassword })
      setShowActivate(false)
      setActivateEmail('')
      setActivatePassword('')
      await reload()
    } catch (err) {
      setActivateError(translateFunctionError(err))
    } finally {
      setActivateLoading(false)
    }
  }

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/data-siswa')} className="text-gray-500 dark:text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white truncate flex-1">{student.studentName}</h1>
          <button onClick={() => setShowEdit(true)} className="text-primary-700 dark:text-primary-400">
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={() => setShowDelete(true)} className="text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-gradient-to-br from-primary-700 to-primary-800 rounded-2xl p-5 text-white">
          <p className="text-primary-100 text-sm">Saldo Saat Ini</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(student.balance)}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <div>
              <p className="text-primary-200">Total Setoran</p>
              <p className="font-semibold">{formatCurrency(student.totalDeposit)}</p>
            </div>
            <div>
              <p className="text-primary-200">Total Penarikan</p>
              <p className="font-semibold">{formatCurrency(student.totalWithdrawal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">NIS</span>
            <span className="text-gray-900 dark:text-white font-medium">{student.nis}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">NISN</span>
            <span className="text-gray-900 dark:text-white font-medium">{student.nisn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Orang Tua</span>
            <span className="text-gray-900 dark:text-white font-medium">{student.parentName || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">No. HP Orang Tua</span>
            <span className="text-gray-900 dark:text-white font-medium">{student.parentPhone || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Tahun Ajaran</span>
            <span className="text-gray-900 dark:text-white font-medium">{student.academicYear}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <span className={student.isActive ? 'text-success-600 dark:text-success-400 font-medium' : 'text-gray-400 font-medium'}>
              {student.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Akun Login</span>
            {student.authUserId ? (
              <span className="text-success-600 dark:text-success-400 font-medium">Sudah Aktif</span>
            ) : (
              <button onClick={() => setShowActivate(true)} className="text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Aktifkan
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowQuickTx(true)}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl py-3"
        >
          + Transaksi Baru
        </button>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Riwayat Transaksi</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex items-center gap-3">
                  {tx.amount >= 0 ? (
                    <ArrowDownCircle className="w-8 h-8 text-success-600 flex-shrink-0" />
                  ) : (
                    <ArrowUpCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{tx.type}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(tx.createdAt)} · {tx.transactionNumber}</p>
                    {tx.note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{tx.note}</p>}
                  </div>
                  <p className={`text-sm font-semibold flex-shrink-0 ${tx.amount >= 0 ? 'text-success-700 dark:text-success-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && teacher && (
        <StudentFormModal
          initial={student}
          defaultAcademicYear={teacher.academicYear}
          onClose={() => setShowEdit(false)}
          onSubmit={async (data) => {
            try {
              await updateStudent(student.id, data)
              await reload()
            } catch (err) {
              throw new Error(translateStudentError(err))
            }
          }}
        />
      )}

      {showQuickTx && (
        <QuickTransactionModal
          preselectedStudent={student}
          onClose={() => setShowQuickTx(false)}
          onSuccess={reload}
        />
      )}

      {showActivate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Aktifkan Login Siswa</h3>
            {activateError && (
              <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-3 py-2 mb-3">
                {activateError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email Siswa</label>
                <input
                  type="email"
                  value={activateEmail}
                  onChange={(e) => setActivateEmail(e.target.value)}
                  placeholder="email orang tua/siswa"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password</label>
                <input
                  type="text"
                  value={activatePassword}
                  onChange={(e) => setActivatePassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowActivate(false)} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl py-2.5">
                Batal
              </button>
              <button
                onClick={handleActivate}
                disabled={activateLoading}
                className="flex-1 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5"
              >
                {activateLoading ? 'Memproses...' : 'Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Hapus Siswa?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Data <strong>{student.studentName}</strong> beserta seluruh riwayat transaksinya akan terhapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl py-2.5">
                Batal
              </button>
              <button
                onClick={async () => {
                  await deleteStudent(student.id)
                  navigate('/data-siswa')
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

