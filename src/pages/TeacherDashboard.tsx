import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, TrendingUp, TrendingDown, Wallet, Settings as SettingsIcon, FileText, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/services/auth'
import { listStudents } from '@/services/students'
import { listTeacherTransactions } from '@/services/transactions'
import { formatCurrency, formatMonthLabel } from '@/utils/format'
import QuickTransactionModal from '@/components/QuickTransactionModal'
import type { Student, Transaction } from '@/types'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { teacher, license } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [yearTransactions, setYearTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showQuickTx, setShowQuickTx] = useState(false)

  async function reload() {
    if (!teacher) return
    setLoading(true)
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString()
    const yearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).toISOString()
    const [s, tx] = await Promise.all([
      listStudents(teacher.id),
      listTeacherTransactions(teacher.id, { start: yearStart, end: yearEnd })
    ])
    setStudents(s)
    setYearTransactions(tx)
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher?.id])

  const totalBalance = useMemo(() => students.reduce((sum, s) => sum + s.balance, 0), [students])

  const todayStats = useMemo(() => {
    const today = new Date().toDateString()
    let setoran = 0
    let penarikan = 0
    for (const tx of yearTransactions) {
      if (new Date(tx.createdAt).toDateString() !== today) continue
      if (tx.type === 'setoran') setoran += tx.amount
      if (tx.type === 'penarikan') penarikan += Math.abs(tx.amount)
    }
    return { setoran, penarikan }
  }, [yearTransactions])

  const monthlyChart = useMemo(() => {
    const sums = Array(12).fill(0)
    for (const tx of yearTransactions) {
      const m = new Date(tx.createdAt).getMonth()
      sums[m] += tx.amount
    }
    let cumulative = 0
    return sums.map((v, i) => {
      cumulative += v
      return { month: formatMonthLabel(i), total: Math.max(0, cumulative) }
    })
  }, [yearTransactions])

  const isTrialExpiringSoon =
    license?.status === 'trial' &&
    new Date(license.trialEnd).getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-primary-700 dark:bg-primary-900 text-white px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">{teacher?.schoolName}</p>
            <h1 className="text-xl font-bold">{teacher?.className}</h1>
            <p className="text-primary-200 text-sm">{teacher?.teacherName}</p>
          </div>
          <button onClick={() => logout()} className="text-primary-200">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-5">
        {isTrialExpiringSoon && (
          <button
            onClick={() => navigate('/aktivasi-lisensi')}
            className="w-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400 text-sm rounded-xl px-4 py-3 mb-3 text-left"
          >
            Masa trial akan berakhir dalam beberapa hari. Tap untuk aktivasi lisensi.
          </button>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
            <Wallet className="w-4 h-4" /> Total Saldo Seluruh Siswa
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBalance)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center gap-1.5 text-success-600 dark:text-success-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Setoran Hari Ini
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(todayStats.setoran)}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center gap-1.5 text-red-500 text-xs mb-1">
              <TrendingDown className="w-3.5 h-3.5" /> Penarikan Hari Ini
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(todayStats.penarikan)}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/data-siswa')}
          className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <Users className="w-4 h-4" /> Jumlah Siswa
          </div>
          <span className="font-bold text-gray-900 dark:text-white">{students.length}</span>
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Perkembangan Tabungan Bulanan</p>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="total" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => navigate('/laporan')}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center gap-1.5"
          >
            <FileText className="w-5 h-5 text-primary-700 dark:text-primary-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Laporan</span>
          </button>
          <button
            onClick={() => navigate('/pengaturan')}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center gap-1.5"
          >
            <SettingsIcon className="w-5 h-5 text-primary-700 dark:text-primary-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Pengaturan</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowQuickTx(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-full px-6 py-3.5 shadow-lg flex items-center gap-2"
      >
        <Wallet className="w-5 h-5" /> Transaksi Cepat
      </button>

      {showQuickTx && (
        <QuickTransactionModal onClose={() => setShowQuickTx(false)} onSuccess={reload} />
      )}
    </div>
  )
}
