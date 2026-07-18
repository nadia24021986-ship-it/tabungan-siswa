export type UserRole = 'teacher' | 'student'

export interface UserProfile {
  id: string
  role: UserRole
  fullName: string
  createdAt: number
}

export interface Teacher {
  id: string
  teacherName: string
  className: string
  schoolName: string
  academicYear: string
  theme: 'light' | 'dark'
  createdAt: number
  updatedAt: number
}

export interface Student {
  id: string
  teacherId: string
  nis: string
  nisn: string
  studentName: string
  parentName: string
  parentPhone: string
  academicYear: string
  isActive: boolean
  authUserId: string | null
  balance: number
  totalDeposit: number
  totalWithdrawal: number
  createdAt: number
  updatedAt: number
}

export type TransactionType = 'setoran' | 'penarikan' | 'koreksi'

export interface Transaction {
  id: string
  teacherId: string
  studentId: string
  studentName?: string
  transactionNumber: string
  type: TransactionType
  amount: number
  balanceAfter: number
  note: string
  createdBy: string
  createdAt: number
}

export interface Settings {
  teacherId: string
  receiptFooterNote: string
  minWithdrawalBalance: number
  updatedAt: number
}

export type LicenseStatus = 'trial' | 'active' | 'expired'

export interface License {
  teacherId: string
  status: LicenseStatus
  trialStart: number
  trialEnd: number
  activationKey: string | null
  activatedAt: number | null
  expiresAt: number | null
}

export interface AuthContextValue {
  firebaseUser: import('firebase/auth').User | null
  profile: UserProfile | null
  teacher: Teacher | null
  student: Student | null
  license: License | null
  loading: boolean
}

