-- =====================================================================
-- TABUNGAN SISWA PRO — FUNGSI SQL PENDUKUNG
-- Jalankan SETELAH 001_schema_ts_prefix.sql, di SQL Editor yang sama.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabel counter nomor transaksi harian per guru (TRX-YYYYMMDD-0001)
-- ---------------------------------------------------------------------
create table public.ts_counters (
  teacher_id uuid not null references public.ts_teachers(id) on delete cascade,
  date_key text not null,
  count integer not null default 0,
  primary key (teacher_id, date_key)
);
alter table public.ts_counters enable row level security;
-- Tidak ada policy client sama sekali -- hanya diakses lewat fungsi
-- security definer di bawah ini.

-- ---------------------------------------------------------------------
-- ts_create_transaction — satu-satunya cara transaksi tersimpan.
-- Row lock (FOR UPDATE) pada baris siswa mencegah race condition kalau
-- guru input beberapa transaksi cepat berturut-turut (Transaksi Cepat).
-- ---------------------------------------------------------------------
create or replace function public.ts_create_transaction(
  p_teacher_id uuid,
  p_student_id uuid,
  p_type text,
  p_amount numeric,
  p_note text,
  p_created_by uuid
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
  v_delta numeric;
  v_new_balance numeric;
  v_date_key text;
  v_seq int;
  v_txn_number text;
  v_txn_id uuid;
begin
  if p_type not in ('setoran', 'penarikan', 'koreksi') then
    raise exception 'Jenis transaksi tidak valid.';
  end if;

  select * into v_student from public.ts_students
    where id = p_student_id and teacher_id = p_teacher_id
    for update;
  if not found then
    raise exception 'Data siswa tidak ditemukan.';
  end if;

  if p_type = 'setoran' then
    v_delta := abs(p_amount);
  elsif p_type = 'penarikan' then
    v_delta := -abs(p_amount);
  else
    v_delta := p_amount;
  end if;

  v_new_balance := v_student.balance + v_delta;
  if p_type = 'penarikan' and v_new_balance < 0 then
    raise exception 'Saldo siswa tidak mencukupi untuk penarikan ini.';
  end if;

  v_date_key := to_char(now(), 'YYYYMMDD');

  insert into public.ts_counters (teacher_id, date_key, count)
    values (p_teacher_id, v_date_key, 1)
    on conflict (teacher_id, date_key)
    do update set count = ts_counters.count + 1
    returning count into v_seq;

  v_txn_number := 'TRX-' || v_date_key || '-' || lpad(v_seq::text, 4, '0');

  insert into public.ts_transactions (
    teacher_id, student_id, transaction_number, type, amount, balance_after, note, created_by
  ) values (
    p_teacher_id, p_student_id, v_txn_number, p_type, v_delta, v_new_balance, p_note, p_created_by
  ) returning id into v_txn_id;

  update public.ts_students set
    balance = v_new_balance,
    total_deposit = total_deposit + case when p_type = 'setoran' then abs(p_amount) else 0 end,
    total_withdrawal = total_withdrawal + case when p_type = 'penarikan' then abs(p_amount) else 0 end,
    updated_at = now()
  where id = p_student_id;

  return json_build_object(
    'transactionNumber', v_txn_number,
    'newBalance', v_new_balance,
    'transactionId', v_txn_id
  );
end;
$$;

-- Hanya boleh dipanggil lewat service_role (dari dalam Edge Function),
-- TIDAK boleh dipanggil langsung dari browser/APK.
revoke execute on function public.ts_create_transaction from public, anon, authenticated;
grant execute on function public.ts_create_transaction to service_role;

-- ---------------------------------------------------------------------
-- ts_redeem_license_key — aktivasi lisensi, row lock cegah kunci
-- yang sama terpakai dua kali secara bersamaan.
-- ---------------------------------------------------------------------
create or replace function public.ts_redeem_license_key(
  p_teacher_id uuid,
  p_activation_key text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key record;
  v_expires_at timestamptz;
begin
  select * into v_key from public.ts_license_keys
    where activation_key = p_activation_key
    for update;

  if not found then
    raise exception 'Kunci aktivasi tidak ditemukan.';
  end if;
  if v_key.is_used then
    raise exception 'Kunci aktivasi ini sudah pernah dipakai.';
  end if;

  v_expires_at := now() + (v_key.duration_days || ' days')::interval;

  update public.ts_license_keys set
    is_used = true,
    used_by_teacher_id = p_teacher_id,
    used_at = now()
  where activation_key = p_activation_key;

  update public.ts_licenses set
    status = 'active',
    activation_key = p_activation_key,
    activated_at = now(),
    expires_at = v_expires_at
  where teacher_id = p_teacher_id;

  return json_build_object('success', true, 'expiresAt', v_expires_at);
end;
$$;

revoke execute on function public.ts_redeem_license_key from public, anon, authenticated;
grant execute on function public.ts_redeem_license_key to service_role;

-- =====================================================================
-- Cara generate kunci lisensi baru (dijalankan manual oleh Indro lewat
-- SQL Editor, BUKAN dari aplikasi):
--
-- insert into public.ts_license_keys (activation_key, duration_days)
-- values ('TSP-XXXX-XXXX', 365);
--
-- Ganti TSP-XXXX-XXXX dengan kode unik pilihan Anda tiap kali jual
-- lisensi ke guru baru.
-- =====================================================================

