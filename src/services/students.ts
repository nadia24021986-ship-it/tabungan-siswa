import { supabase } from '@/services/supabase'
import { mapStudent } from '@/utils/mappers'
import type { Student } from '@/types'

export async function listStudents(teacherId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from('ts_students')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('student_name', { ascending: true })
  if (error) throw error
  return (data || []).map(mapStudent)
}

export async function getStudent(studentId: string): Promise<Student | null> {
  const { data, error } = await supabase.from('ts_students').select('*').eq('id', studentId).maybeSingle()
  if (error) throw error
  return data ? mapStudent(data) : null
}

export async function createStudent(params: {
  teacherId: string
  nis: string
  nisn: string
  studentName: string
  parentName: string
  parentPhone: string
  academicYear: string
  isActive: boolean
}) {
  const { error } = await supabase.from('ts_students').insert({
    teacher_id: params.teacherId,
    nis: params.nis,
    nisn: params.nisn,
    student_name: params.studentName,
    parent_name: params.parentName,
    parent_phone: params.parentPhone,
    academic_year: params.academicYear,
    is_active: params.isActive
  })
  if (error) throw error
}

export async function updateStudent(
  studentId: string,
  params: Partial<{
    nis: string
    nisn: string
    studentName: string
    parentName: string
    parentPhone: string
    academicYear: string
    isActive: boolean
  }>
) {
  const payload: Record<string, unknown> = {}
  if (params.nis !== undefined) payload.nis = params.nis
  if (params.nisn !== undefined) payload.nisn = params.nisn
  if (params.studentName !== undefined) payload.student_name = params.studentName
  if (params.parentName !== undefined) payload.parent_name = params.parentName
  if (params.parentPhone !== undefined) payload.parent_phone = params.parentPhone
  if (params.academicYear !== undefined) payload.academic_year = params.academicYear
  if (params.isActive !== undefined) payload.is_active = params.isActive

  const { error } = await supabase.from('ts_students').update(payload).eq('id', studentId)
  if (error) throw error
}

export async function deleteStudent(studentId: string) {
  const { error } = await supabase.from('ts_students').delete().eq('id', studentId)
  if (error) throw error
}

/** Terjemahkan error unique constraint (NIS/NISN duplikat) ke Bahasa Indonesia */
export function translateStudentError(err: unknown): string {
  const message = (err as { message?: string })?.message ?? ''
  if (message.includes('ts_students_teacher_id_nis_key')) return 'NIS ini sudah dipakai siswa lain di kelas Anda.'
  if (message.includes('ts_students_teacher_id_nisn_key')) return 'NISN ini sudah dipakai siswa lain di kelas Anda.'
  return message || 'Terjadi kesalahan. Silakan coba lagi.'
}

