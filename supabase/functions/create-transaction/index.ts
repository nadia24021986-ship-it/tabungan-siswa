// Edge Function: create-transaction
// Satu-satunya jalan transaksi tersimpan. Nomor transaksi otomatis
// (TRX-YYYYMMDD-0001), saldo siswa diperbarui atomic lewat fungsi SQL
// ts_create_transaction (lihat 002_functions.sql), supaya tidak ada
// race condition kalau guru input transaksi cepat berturut-turut.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Anda harus login sebagai Guru.')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Client biasa untuk verifikasi identitas pemanggil dari token JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) throw new Error('Sesi tidak valid, silakan login ulang.')
    const teacherId = userData.user.id

    const { studentId, type, amount, note } = await req.json()
    if (!studentId || !['setoran', 'penarikan', 'koreksi'].includes(type)) {
      throw new Error('Data transaksi tidak lengkap atau tidak valid.')
    }
    const numAmount = Number(amount)
    if (!numAmount || numAmount === 0) throw new Error('Nominal transaksi tidak valid.')

    // Client service_role untuk eksekusi fungsi SQL yang bypass RLS
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await adminClient.rpc('ts_create_transaction', {
      p_teacher_id: teacherId,
      p_student_id: studentId,
      p_type: type,
      p_amount: numAmount,
      p_note: note || '',
      p_created_by: teacherId
    })
    if (error) throw new Error(error.message)

    return new Response(JSON.stringify({ success: true, ...data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
