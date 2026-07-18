import { supabase } from '@/services/supabase'

export interface LicenseKeyRow {
  id: string
  activation_key: string
  duration_days: number
  is_used: boolean
  used_by_teacher_id: string | null
  used_at: string | null
  created_at: string
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-license-keys', { body })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data as T
}

export async function listLicenseKeys() {
  const res = await invoke<{ keys: LicenseKeyRow[] }>({ action: 'list' })
  return res.keys
}

export async function generateLicenseKeys(count: number, durationDays: number) {
  const res = await invoke<{ keys: LicenseKeyRow[] }>({ action: 'generate', count, durationDays })
  return res.keys
}
