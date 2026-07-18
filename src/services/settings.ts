import { supabase } from '@/services/supabase'

export async function updateTeacherProfile(
  teacherId: string,
  params: { teacherName: string; className: string; schoolName: string; academicYear: string }
) {
  const { error } = await supabase
    .from('ts_teachers')
    .update({
      teacher_name: params.teacherName,
      class_name: params.className,
      school_name: params.schoolName,
      academic_year: params.academicYear
    })
    .eq('id', teacherId)
  if (error) throw error
}

export async function updateTheme(teacherId: string, theme: 'light' | 'dark') {
  const { error } = await supabase.from('ts_teachers').update({ theme }).eq('id', teacherId)
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

