import { supabase } from '@/services/supabase'
import { mapTransaction } from '@/utils/mappers'
import type { Transaction } from '@/types'

export async function listStudentTransactions(studentId: string, limit = 100): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('ts_transactions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map(mapTransaction)
}

export async function listTeacherTransactions(
  teacherId: string,
  range?: { start: string; end: string }
): Promise<Transaction[]> {
  let q = supabase.from('ts_transactions').select('*').eq('teacher_id', teacherId)
  if (range) {
    q = q.gte('created_at', range.start).lte('created_at', range.end)
  }
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapTransaction)
}

