// Edge Function: redeem-license-key
// Aktivasi lisensi pakai kunci TSP-XXXX-XXXX. Logic utama ada di
// fungsi SQL ts_redeem_license_key (row lock, anti dipakai 2x).

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

    const { activationKey } = await req.json()
    if (!activationKey || typeof activationKey !== 'string') {
      throw new Error('Kunci aktivasi tidak valid.')
    }
    const key = activationKey.trim().toUpperCase()

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await adminClient.rpc('ts_redeem_license_key', {
      p_teacher_id: teacherId,
      p_activation_key: key
    })
    if (error) throw new Error(error.message)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
