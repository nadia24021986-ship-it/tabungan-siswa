import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import { mapProfile, mapTeacher, mapStudent, mapLicense } from '@/utils/mappers'
import type { Profile, Teacher, Student, License } from '@/types'

interface AuthContextValue {
  authUser: User | null
  profile: Profile | null
  teacher: Teacher | null
  student: Student | null
  license: License | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [license, setLicense] = useState<License | null>(null)
  const [loading, setLoading] = useState(true)

  // Pantau status login Supabase Auth (termasuk auto refresh token)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user ?? null)
      if (!data.session) setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
      if (!session) {
        setProfile(null)
        setTeacher(null)
        setStudent(null)
        setLicense(null)
        setLoading(false)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Ambil profil (role) begitu user login
  useEffect(() => {
    if (!authUser) return
    let cancelled = false
    supabase
      .from('ts_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setProfile(null)
          setLoading(false)
          return
        }
        setProfile(mapProfile(data))
      })
    return () => {
      cancelled = true
    }
  }, [authUser])

  // Kalau role = teacher: ambil data guru + lisensi, dengarkan
  // perubahan realtime (misal lisensi diaktifkan lewat Edge Function)
  useEffect(() => {
    if (!profile || profile.role !== 'teacher') {
      if (profile && profile.role !== 'teacher') setLoading(false)
      return
    }

    async function loadTeacherData() {
      const [{ data: teacherRow }, { data: licenseRow }] = await Promise.all([
        supabase.from('ts_teachers').select('*').eq('id', profile!.id).maybeSingle(),
        supabase.from('ts_licenses').select('*').eq('teacher_id', profile!.id).maybeSingle()
      ])
      setTeacher(teacherRow ? mapTeacher(teacherRow) : null)
      setLicense(licenseRow ? mapLicense(licenseRow) : null)
      setLoading(false)
    }
    loadTeacherData()

    const channel = supabase
      .channel(`ts_teacher_${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ts_licenses', filter: `teacher_id=eq.${profile.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') setLicense(null)
          else setLicense(mapLicense(payload.new))
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ts_teachers', filter: `id=eq.${profile.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') setTeacher(null)
          else setTeacher(mapTeacher(payload.new))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile])

  // Kalau role = student: cari baris ts_students lewat auth_user_id
  useEffect(() => {
    if (!profile || profile.role !== 'student') return

    async function loadStudentData() {
      const { data } = await supabase
        .from('ts_students')
        .select('*')
        .eq('auth_user_id', profile!.id)
        .maybeSingle()
      setStudent(data ? mapStudent(data) : null)
      setLoading(false)
    }
    loadStudentData()

    const channel = supabase
      .channel(`ts_student_${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ts_students', filter: `auth_user_id=eq.${profile.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') setStudent(null)
          else setStudent(mapStudent(payload.new))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile])

  return (
    <AuthContext.Provider value={{ authUser, profile, teacher, student, license, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}

