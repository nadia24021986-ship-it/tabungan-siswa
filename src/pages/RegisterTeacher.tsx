import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { registerTeacher, translateAuthError } from '@/services/auth'

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_ACADEMIC_YEAR = `${CURRENT_YEAR}/${CURRENT_YEAR + 1}`

export default function RegisterTeacher() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    teacherName: '',
    schoolName: '',
    className: '',
    academicYear: DEFAULT_ACADEMIC_YEAR,
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      await registerTeacher({
        email: form.email.trim(),
        password: form.password,
        teacherName: form.teacherName.trim(),
        className: form.className.trim(),
        schoolName: form.schoolName.trim(),
        academicYear: form.academicYear.trim()
      })
      navigate('/')
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(translateAuthError(code))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'

  return (
    <div className="min-h-screen bg-gradient-to-b from-success-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-success-600 rounded-2xl p-3 mb-4 shadow-lg shadow-success-600/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Akun Guru</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
            Trial gratis 30 hari, tanpa kartu kredit
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Nama Guru</label>
            <input required value={form.teacherName} onChange={(e) => update('teacherName', e.target.value)} placeholder="Nama lengkap" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Nama Sekolah</label>
            <input required value={form.schoolName} onChange={(e) => update('schoolName', e.target.value)} placeholder="SD Negeri 1 ..." className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nama Kelas</label>
              <input required value={form.className} onChange={(e) => update('className', e.target.value)} placeholder="Kelas 5A" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tahun Ajaran</label>
              <input required value={form.academicYear} onChange={(e) => update('academicYear', e.target.value)} placeholder="2026/2027" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" required autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="nama@email.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input type="password" required autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimal 6 karakter" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-success-600 hover:bg-success-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary-700 dark:text-primary-400 font-semibold">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}

