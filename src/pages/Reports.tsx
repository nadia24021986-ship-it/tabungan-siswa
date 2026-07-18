import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, FileDown, FileSpreadsheet, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { listStudents } from '@/services/students'
import { listTeacherTransactions } from '@/services/transactions'
import { formatCurrency, formatDate } from '@/utils/format'
import { exportToPDF, exportToExcel, exportToJPG, printReport, type ReportRow } from '@/services/reportExport'
import type { Student, Transaction } from '@/types'

type Period = 'harian' | 'mingguan' | 'bulanan' | 'tahunan'

function getRange(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date()
  if (period === 'harian') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return { start, end, label: formatDate(start.toISOString()) }
  }
  if (period === 'mingguan') {
    const day = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59)
    return { start, end, label: `${formatDate(start.toISOString())} - ${formatDate(end.toISOString())}` }
  }
  if (period === 'bulanan') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    return { start, end, label: start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }
  }
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
  return { start, end, label: `Tahun ${now.getFullYear()}` }
}

export default function Reports() {
  const navigate = useNavigate()
  const { teacher } = useAuth()
  const [period, setPeriod] = useState<Period>('harian')
  const [studentFilter, setStudentFilter] = useState<string>('all')
  const [students, setStudents] = useState<Student[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teacher) return
    listStudents(teacher.id).then(setStudents)
  }, [teacher?.id])

  useEffect(() => {
    if (!teacher) return
    setLoading(true)
    const { start, end } = getRange(period)
    listTeacherTransactions(teacher.id, { start: start.toISOString(), end: end.toISOString() }).then((tx) => {
      setTransactions(tx)
      setLoading(false)
    })
  }, [teacher?.id, period])

  const range = getRange(period)
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.studentName])), [students])

  const filteredTx = useMemo(() => {
    if (studentFilter === 'all') return transactions
    return transactions.filter((t) => t.studentId === studentFilter)
  }, [transactions, studentFilter])

  const rows: ReportRow[] = useMemo(
    () =>
      filteredTx.map((tx, i) => ({
        no: i + 1,
        tanggal: formatDate(tx.createdAt),
        siswa: studentMap.get(tx.studentId) ?? '-',
        jenis: tx.type,
        nominal: tx.amount,
        saldoAkhir: formatCurrency(tx.balanceAfter),
        catatan: tx.note ?? ''
      })),
    [filteredTx, studentMap]
  )

  const totalSetoran = filteredTx.filter((t) => t.type === 'setoran').reduce((s, t) => s + t.amount, 0)
  const totalPenarikan = filteredTx.filter((t) => t.type === 'penarikan').reduce((s, t) => s + Math.abs(t.amount), 0)

  const title = `Laporan ${period.charAt(0).toUpperCase() + period.slice(1)} Tabungan Siswa`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 dark:text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">Laporan</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {(['harian', 'mingguan', 'bulanan', 'tahunan'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`py-2 rounded-xl text-xs font-medium capitalize ${
                period === p ? 'bg-primary-700 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <select
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
        >
          <option value="all">Seluruh Siswa</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.studentName}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Setoran</p>
            <p className="font-bold text-success-700 dark:text-success-400 text-sm">{formatCurrency(totalSetoran)}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Penarikan</p>
            <p className="font-bold text-red-600 dark:text-red-400 text-sm">{formatCurrency(totalPenarikan)}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => printReport('report-table')} className="flex items-center gap-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2">
            <Printer className="w-3.5 h-3.5" /> Cetak
          </button>
          <button onClick={() => exportToPDF(rows, title, range.label)} className="flex items-center gap-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2">
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={() => exportToExcel(rows, title)} className="flex items-center gap-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={() => exportToJPG('report-table', title)} className="flex items-center gap-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2">
            <ImageIcon className="w-3.5 h-3.5" /> JPG
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div id="report-table">
              <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{range.label}</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-primary-700 text-white">
                    <th className="p-2 text-left rounded-l-lg">No</th>
                    <th className="p-2 text-left">Tanggal</th>
                    <th className="p-2 text-left">Siswa</th>
                    <th className="p-2 text-left">Jenis</th>
                    <th className="p-2 text-right">Nominal</th>
                    <th className="p-2 text-right rounded-r-lg">Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-400">Tidak ada transaksi pada periode ini</td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.no} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-2 text-gray-700 dark:text-gray-300">{r.no}</td>
                        <td className="p-2 text-gray-700 dark:text-gray-300">{r.tanggal}</td>
                        <td className="p-2 text-gray-900 dark:text-white font-medium">{r.siswa}</td>
                        <td className="p-2 text-gray-700 dark:text-gray-300 capitalize">{r.jenis}</td>
                        <td className={`p-2 text-right font-medium ${r.nominal >= 0 ? 'text-success-700 dark:text-success-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(r.nominal)}
                        </td>
                        <td className="p-2 text-right text-gray-700 dark:text-gray-300">{r.saldoAkhir}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

