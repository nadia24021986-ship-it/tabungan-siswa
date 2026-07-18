// Edge Function: create-student-account
// Guru mengaktifkan login untuk siswa. Membuat akun Supabase Auth +
// profil, lalu menautkan auth_user_id ke baris siswa yang bersangkutan.

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

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) throw new Error('Sesi tidak valid, silakan login ulang.')
    const teacherId = userData.user.id

    const { studentId, email, password } = await req.json()
    if (!studentId || !email || !password) throw new Error('Email dan password wajib diisi.')
    if (password.length < 6) throw new Error('Password minimal 6 karakter.')

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Pastikan siswa ini milik guru yang memanggil, dan belum punya akun
    const { data: student, error: studentError } = await adminClient
      .from('ts_students')
      .select('*')
      .eq('id', studentId)
      .eq('teacher_id', teacherId)
      .maybeSingle()
    if (studentError || !student) throw new Error('Data siswa tidak ditemukan.')
    if (student.auth_user_id) throw new Error('Siswa ini sudah punya akun login.')

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (createError) {
      if (createError.message.includes('already been registered')) {
        throw new Error('Email ini sudah dipakai akun lain.')
      }
      throw new Error(createError.message)
    }
    const newUid = created.user.id

    const { error: profileError } = await adminClient.from('ts_profiles').insert({
      id: newUid,
      role: 'student',
      full_name: student.student_name
    })
    if (profileError) throw new Error(profileError.message)

    const { error: updateError } = await adminClient
      .from('ts_students')
      .update({ auth_user_id: newUid })
      .eq('id', studentId)
    if (updateError) throw new Error(updateError.message)

    return new Response(JSON.stringify({ success: true, uid: newUid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

