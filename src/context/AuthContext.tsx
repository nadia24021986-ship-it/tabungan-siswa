import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import type { AuthContextValue, UserProfile, Teacher, Student, License } from '@/types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [license, setLicense] = useState<License | null>(null)
  const [loading, setLoading] = useState(true)

  // Pantau status login Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      if (!user) {
        setProfile(null)
        setTeacher(null)
        setStudent(null)
        setLicense(null)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  // Dengarkan dokumen profil user (menentukan role: teacher/student)
  useEffect(() => {
    if (!firebaseUser) return
    const unsub = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...(snap.data() as Omit<UserProfile, 'id'>) })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [firebaseUser])

  // Kalau role = teacher, dengarkan data guru + lisensi secara realtime
  useEffect(() => {
    if (!profile || profile.role !== 'teacher') {
      if (profile?.role !== 'teacher') setLoading(false)
      return
    }
    const unsubTeacher = onSnapshot(doc(db, 'teachers', profile.id), (snap) => {
      setTeacher(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Teacher, 'id'>) }) : null)
      setLoading(false)
    })
    const unsubLicense = onSnapshot(doc(db, 'teachers', profile.id, 'license', 'status'), (snap) => {
      setLicense(snap.exists() ? (snap.data() as License) : null)
    })
    return () => {
      unsubTeacher()
      unsubLicense()
    }
  }, [profile])

  // Kalau role = student: cari teacherId & studentId lewat dokumen
  // studentLinks/{uid} (dibuat otomatis oleh Cloud Function saat akun
  // login siswa dibuat). Ini dipakai supaya siswa bisa login dari HP
  // atau browser manapun, tidak bergantung penyimpanan lokal perangkat.
  useEffect(() => {
    if (!profile || profile.role !== 'student') return
    const unsubLink = onSnapshot(doc(db, 'studentLinks', profile.id), (linkSnap) => {
      if (!linkSnap.exists()) {
        setStudent(null)
        setLoading(false)
        return
      }
      const { teacherId, studentId } = linkSnap.data() as { teacherId: string; studentId: string }
      const unsubStudent = onSnapshot(doc(db, 'teachers', teacherId, 'students', studentId), (snap) => {
        setStudent(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Student, 'id'>) }) : null)
        setLoading(false)
      })
      return unsubStudent
    })
    return () => unsubLink()
  }, [profile])

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, teacher, student, license, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}

