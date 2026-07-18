import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'

/**
 * Registrasi akun Guru baru.
 * Membuat 3 dokumen sekaligus: users/{uid}, teachers/{uid}.
 * Trial lisensi & settings default dibuat otomatis oleh Cloud Function
 * (trigger onCreate di teachers/{teacherId}), bukan di sini — supaya
 * client tidak bisa mengatur sendiri tanggal trial-nya.
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
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const uid = cred.user.uid

  await setDoc(doc(db, 'users', uid), {
    role: 'teacher',
    fullName: teacherName,
    createdAt: serverTimestamp()
  })

  await setDoc(doc(db, 'teachers', uid), {
    teacherName,
    className,
    schoolName,
    academicYear,
    theme: 'light',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return cred.user
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logout() {
  await signOut(auth)
}

/** Terjemahkan kode error Firebase Auth ke pesan Bahasa Indonesia */
export function translateAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan login.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/user-not-found': 'Akun tidak ditemukan. Periksa kembali email Anda.',
    'auth/wrong-password': 'Password salah.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
    'auth/network-request-failed': 'Koneksi internet bermasalah. Periksa jaringan Anda.'
  }
  return map[code] ?? 'Terjadi kesalahan. Silakan coba lagi.'
}

