export type UserRole = 'teacher' | 'student'

export interface Profile {
  id: string
  role: UserRole
  fullName: string
  createdAt: string
}

export interface Teacher {
  id: string
  teacherName: string
  className: string
  schoolName: string | null
  academicYear: string
  theme: 'light' | 'dark'
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: string
  teacherId: string
  authUserId: string | null
  nis: string
  nisn: string
  studentName: string
  parentName: string | null
  parentPhone: string | null
  academicYear: string
  isActive: boolean
  balance: number
  totalDeposit: number
  totalWithdrawal: number
  createdAt: string
  updatedAt: string
}

export type TransactionType = 'setoran' | 'penarikan' | 'koreksi'

export interface Transaction {
  id: string
  teacherId: string
  studentId: string
  transactionNumber: string
  type: TransactionType
  amount: number
  balanceAfter: number
  note: string | null
  createdBy: string
  createdAt: string
}

export interface Settings {
  teacherId: string
  receiptFooterNote: string | null
  minWithdrawalBalance: number
  updatedAt: string
}

export type LicenseStatus = 'trial' | 'active' | 'expired'

export interface License {
  teacherId: string
  status: LicenseStatus
  trialStart: string
  trialEnd: string
  activationKey: string | null
  activatedAt: string | null
  expiresAt: string | null
}

