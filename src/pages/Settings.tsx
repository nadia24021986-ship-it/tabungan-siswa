import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sun, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { updateTeacherProfile, updateTheme, updatePassword } from '@/services/settings'
import { redeemLicenseKey, translateFunctionError } from '@/services/functions'

const WHATSAPP_NUMBER = '6281384325809'

export default function Settings() {
  const navigate = useNavigate()
  const { teacher, license } = useAuth()
  const [form, setForm] = useState({
    teacherName: teacher?.teacherName ?? '',
    className: teacher?.className ?? '',
    schoolName: teacher?.schoolName ?? '',
    academicYear: teacher?.academicYear ?? ''
  })
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [licenseKeyInput, setLicenseKeyInput] = useState('')
  const [licenseLoading, setLicenseLoading] = useState(false)
  const [licenseError, setLicenseError] = useState('')
  const [licenseSuccess, setLicenseSuccess] = useState(false)

  const isPermanent = license?.status === 'active' && license.expiresAt === null

  async function handleActivateLicense() {
    setLicenseError('')
    setLicenseLoading(true)
    try {
      await redeemLicenseKey(licenseKeyInput)
      setLicenseSuccess(true)
      setLicenseKeyInput('')
    } catch (err) {
      setLicenseError(translateFunctionError(err))
    } finally {
      setLicenseLoading(false)
    }
  }

  function update<K extends keyof typeof form>(field: K, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    if (!teacher) return
    setSavingProfile(true)
    setProfileMsg('')
    try {
      await updateTeacherProfile(teacher.id, form)
      setProfileMsg('Berhasil disimpan.')
    } catch (err) {
      setProfileMsg((err as Error).message)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMsg('Password minimal 6 karakter.')
      return
    }
    setSavingPassword(true)
    setPasswordMsg('')
    try {
      await updatePassword(newPassword)
      setPasswordMsg('Password berhasil diubah.')
      setNewPassword('')
    } catch (err) {
      setPasswordMsg((err as Error).message)
    } finally {
      setSavingPassword(false)
    }
  }

  async function toggleTheme() {
    if (!teacher) return
    const next = teacher.theme === 'light' ? 'dark' : 'light'
    await updateTheme(teacher.id, next)
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600'
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 dark:text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">Pengaturan</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Status Lisensi</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 capitalize mb-3">
            {isPermanent ? 'Aktif Selamanya' : license?.status === 'trial' ? 'Trial' : license?.status === 'active' ? 'Aktif (Berjangka)' : 'Tidak Aktif'}
          </p>

          {!isPermanent && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Hubungi admin untuk mendapatkan kunci aktivasi lisensi permanen.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-success-600 hover:bg-success-700 text-white text-sm font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 mb-3"
              >
                <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
              </a>

              {licenseError && (
                <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs rounded-lg px-3 py-2 mb-2">
                  {licenseError}
                </div>
              )}
              {licenseSuccess && (
                <div className="bg-success-50 dark:bg-success-950 text-success-700 dark:text-success-400 text-xs rounded-lg px-3 py-2 mb-2">
                  Lisensi berhasil diaktifkan!
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                  placeholder="TSP-XXXX-XXXX"
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-xs text-center tracking-wide font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button
                  onClick={handleActivateLicense}
                  disabled={licenseLoading || !licenseKeyInput}
                  className="bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white text-xs font-semibold rounded-xl px-4"
                >
                  {licenseLoading ? '...' : 'Aktifkan'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            {teacher?.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Mode {teacher?.theme === 'dark' ? 'Gelap' : 'Terang'}
          </div>
          <button
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full transition-colors relative ${teacher?.theme === 'dark' ? 'bg-primary-700' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${teacher?.theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Profil Guru & Kelas</h2>
          {profileMsg && (
            <div className="text-xs rounded-lg px-3 py-2 bg-success-50 dark:bg-success-950 text-success-700 dark:text-success-400">
              {profileMsg}
            </div>
          )}
          <div>
            <label className={labelClass}>Nama Guru</label>
            <input required value={form.teacherName} onChange={(e) => update('teacherName', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nama Sekolah</label>
            <input value={form.schoolName} onChange={(e) => update('schoolName', e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nama Kelas</label>
              <input required value={form.className} onChange={(e) => update('className', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tahun Ajaran</label>
              <input required value={form.academicYear} onChange={(e) => update('academicYear', e.target.value)} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm">
            {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Ubah Password</h2>
          {passwordMsg && (
            <div className="text-xs rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {passwordMsg}
            </div>
          )}
          <div>
            <label className={labelClass}>Password Baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className={inputClass} />
          </div>
          <button type="submit" disabled={savingPassword} className="w-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl py-2.5 text-sm">
            {savingPassword ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
