// Edge Function: admin-license-keys
// Khusus untuk Indro (admin/penjual) generate & lihat daftar kunci
// lisensi. TIDAK bisa diakses guru biasa -- dicek lewat ADMIN_UIDS.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { corsHeaders } from '../_shared/cors.ts'

// ⚠️ GANTI dengan UID akun Supabase Auth milik Indro sendiri sebelum
// dipakai. Cara ambil UID: Supabase Dashboard > Authentication > Users
// > cari email Indro > copy kolom UID.
const ADMIN_UIDS = ['GANTI_DENGAN_UID_ADMIN_KAMU']

function randomBlock(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // tanpa 0,O,1,I biar tidak rancu
  let out = ''
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Anda harus login.')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) throw new Error('Sesi tidak valid, silakan login ulang.')

    if (!ADMIN_UIDS.includes(userData.user.id)) {
      throw new Error('Anda tidak punya akses ke halaman ini.')
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { action, count, durationDays } = await req.json()

    if (action === 'list') {
      const { data, error } = await adminClient
        .from('ts_license_keys')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw new Error(error.message)
      return new Response(JSON.stringify({ keys: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'generate') {
      const n = Math.min(Math.max(Number(count) || 1, 1), 50)
      // durationDays 0 artinya lisensi PERMANEN (tidak pernah kedaluwarsa)
      const duration = durationDays === 0 ? 0 : Number(durationDays) || 365
      const rows = Array.from({ length: n }, () => ({
        activation_key: `TSP-${randomBlock()}-${randomBlock()}`,
        duration_days: duration
      }))
      const { data, error } = await adminClient.from('ts_license_keys').insert(rows).select()
      if (error) throw new Error(error.message)
      return new Response(JSON.stringify({ keys: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Aksi tidak dikenali.')
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
