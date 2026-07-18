import { supabase } from '@/services/supabase'
import type { TransactionType } from '@/types'

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data as T
}

export async function createTransaction(params: {
  studentId: string
  type: TransactionType
  amount: number
  note?: string
}) {
  return invoke<{ success: boolean; transactionNumber: string; newBalance: number }>(
    'create-transaction',
    params
  )
}

export async function createStudentAccount(params: {
  studentId: string
  email: string
  password: string
}) {
  return invoke<{ success: boolean; uid: string }>('create-student-account', params)
}

export async function redeemLicenseKey(activationKey: string) {
  return invoke<{ success: boolean }>('redeem-license-key', { activationKey })
}

/** Terjemahkan error Edge Function ke Bahasa Indonesia */
export function translateFunctionError(err: unknown): string {
  const message = (err as { message?: string })?.message ?? ''
  const map: Record<string, string> = {
    'Saldo siswa tidak mencukupi untuk penarikan ini.': 'Saldo siswa tidak mencukupi untuk penarikan ini.',
    'Kunci aktivasi ini sudah pernah dipakai.': 'Kunci aktivasi ini sudah pernah dipakai.',
    'Kunci aktivasi tidak ditemukan.': 'Kunci aktivasi tidak ditemukan.'
  }
  return map[message] ?? message ?? 'Terjadi kesalahan. Silakan coba lagi.'
}

