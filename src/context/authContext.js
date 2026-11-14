import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

/**
 * Who is logged in.
 *
 *   const { user, role, isLoggedIn, profile, login, logout } = useAuth()
 *
 *   user     -> the account { id, role, email, name, status }  (null for guests)
 *   role     -> 'student' | 'company' | 'admin' | null
 *   profile  -> the student or company record for that account (from db.students / db.companies)
 *
 * For a student, user.id === profile.id === the studentId used in applications/saved.
 * For a company, user.id === profile.id === the companyId used in listings.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
