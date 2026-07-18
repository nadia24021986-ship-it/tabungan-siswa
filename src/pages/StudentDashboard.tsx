import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { LogOut, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/services/auth'
import { listStudentTransactions } from '@/services/transactions'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { Transaction } from '@/types'

export default function StudentDashboard() {
  const { student } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!student) return
    listStudentTransactions(student.id).then((tx) => {
      setTransactions(tx)
      setLoading(false)
    })
  }, [student?.id])

  const chartData = useMemo(() => {
    // Urutkan dari yang paling lama ke terbaru untuk garis grafik
    const sorted = [...transactions].reverse()
    return sorted.map((tx) => ({
      date: new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      saldo: tx.balanceAfter
    }))
  }, [transactions])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-success-700 dark:bg-success-900 text-white px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{student?.studentName ?? 'Siswa'}</h1>
            <p className="text-success-100 text-sm">NIS {student?.nis} · NISN {student?.nisn}</p>
          </div>
          <button onClick={() => logout()} className="text-success-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-5 space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Saldo Saat Ini</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(student?.balance ?? 0)}
          </p>
          <div className="flex gap-4 mt-4 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
            <div>
              <p className="text-gray-400 text-xs">Total Setoran</p>
              <p className="font-semibold text-success-700 dark:text-success-400">{formatCurrency(student?.totalDeposit ?? 0)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Penarikan</p>
              <p className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(student?.totalWithdrawal ?? 0)}</p>
            </div>
          </div>
        </div>

        {chartData.length > 1 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Perkembangan Tabungan</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="saldo" stroke="#059669" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Riwayat Transaksi</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-success-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
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
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(tx.createdAt)}</p>
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
    </div>
  )
}
