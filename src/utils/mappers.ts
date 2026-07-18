// Supabase mengembalikan kolom snake_case (sesuai SQL), sementara kode
// React memakai camelCase. File ini menerjemahkan antara keduanya di
// satu tempat, supaya tidak berulang di banyak file.

import type { Teacher, Student, Transaction, Settings, License, Profile } from '@/types'

export function mapProfile(row: any): Profile {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    createdAt: row.created_at
  }
}

export function mapTeacher(row: any): Teacher {
  return {
    id: row.id,
    teacherName: row.teacher_name,
    className: row.class_name,
    schoolName: row.school_name,
    academicYear: row.academic_year,
    theme: row.theme,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function mapStudent(row: any): Student {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    authUserId: row.auth_user_id,
    nis: row.nis,
    nisn: row.nisn,
    studentName: row.student_name,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    academicYear: row.academic_year,
    isActive: row.is_active,
    balance: Number(row.balance),
    totalDeposit: Number(row.total_deposit),
    totalWithdrawal: Number(row.total_withdrawal),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    studentId: row.student_id,
    transactionNumber: row.transaction_number,
    type: row.type,
    amount: Number(row.amount),
    balanceAfter: Number(row.balance_after),
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at
  }
}

export function mapSettings(row: any): Settings {
  return {
    teacherId: row.teacher_id,
    receiptFooterNote: row.receipt_footer_note,
    minWithdrawalBalance: Number(row.min_withdrawal_balance),
    updatedAt: row.updated_at
  }
}

export function mapLicense(row: any): License {
  return {
    teacherId: row.teacher_id,
    status: row.status,
    trialStart: row.trial_start,
    trialEnd: row.trial_end,
    activationKey: row.activation_key,
    activatedAt: row.activated_at,
    expiresAt: row.expires_at
  }
}

