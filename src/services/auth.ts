import { supabase } from '@/services/supabase'

/**
 * Registrasi akun Guru baru.
 * Trial 30 hari & settings default dibuat OTOMATIS oleh trigger SQL
 * (ts_handle_new_teacher), bukan di sini -- supaya client tidak bisa
 * mengatur sendiri tanggal trial-nya.
 */
export async function registerTeacher(params: {
  email: string
  password: string
  teacherName: string
  className: string
  schoolName: string
  academicYear: string
}) {
  const { email, password, teacherName, className, schoolName, academicYear } = params

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  })
  if (authError) throw authError
  if (!authData.user) throw new Error('Gagal membuat akun.')

  const uid = authData.user.id

  const { error: profileError } = await supabase.from('ts_profiles').insert({
    id: uid,
    role: 'teacher',
    full_name: teacherName
  })
  if (profileError) throw profileError

  const { error: teacherError } = await supabase.from('ts_teachers').insert({
    id: uid,
    teacher_name: teacherName,
    class_name: className,
    school_name: schoolName,
    academic_year: academicYear,
    theme: 'light'
  })
  if (teacherError) throw teacherError

  return authData.user
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function logout() {
  await supabase.auth.signOut()
}

/** Terjemahkan pesan error Supabase Auth ke Bahasa Indonesia */
export function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'User already registered': 'Email ini sudah terdaftar. Silakan login.',
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Email belum diverifikasi. Periksa kotak masuk email Anda.',
    'Password should be at least 6 characters': 'Password minimal 6 karakter.',
    'Unable to validate email address: invalid format': 'Format email tidak valid.'
  }
  return map[message] ?? message ?? 'Terjadi kesalahan. Silakan coba lagi.'
}

