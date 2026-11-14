/*
  Fake authentication for the front-end prototype (FR-A1 .. FR-A5).
  Accounts live in the data store; the logged-in account id is kept in localStorage.
  In Phase 5 this will be replaced by real API calls (bcrypt + JWT on the server).
*/
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { useStore } from '../store/useStore'
import { ACCOUNT_STATUS, ROLES, RULES } from '../lib/constants'
import { makeId } from '../lib/ids'

const SESSION_KEY = 'internconnect-session'

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const { db, insert, update, transaction } = useStore()
  const [accountId, setAccountId] = useState(readSession)

  useEffect(() => {
    try {
      if (accountId) localStorage.setItem(SESSION_KEY, accountId)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      // storage blocked - session just won't survive a refresh
    }
  }, [accountId])

  const user = db.accounts.find((a) => a.id === accountId) ?? null
  const role = user?.role ?? null
  const profile =
    role === ROLES.STUDENT
      ? db.students.find((s) => s.id === user.id)
      : role === ROLES.COMPANY
        ? db.companies.find((c) => c.id === user.id)
        : null

  // a suspended account is kicked out straight away (FR-AD2)
  useEffect(() => {
    if (user?.status === ACCOUNT_STATUS.SUSPENDED) setAccountId(null)
  }, [user?.status])

  const findByEmail = useCallback(
    (email) => db.accounts.find((a) => a.email.toLowerCase() === String(email).trim().toLowerCase()),
    [db.accounts],
  )

  /**
   * FR-A3. Returns { ok: true, account } or { ok: false, code, message }.
   * codes: 'invalid' | 'locked' | 'unverified' | 'suspended'
   * Pending and rejected companies CAN log in - they land on the "waiting for approval" page.
   */
  const login = useCallback(
    (email, password) => {
      const account = findByEmail(email)
      const invalid = { ok: false, code: 'invalid', message: 'Email or password is incorrect.' }
      if (!account) return invalid

      if (account.lockedUntil && new Date(account.lockedUntil) > new Date()) {
        const minutes = Math.ceil((new Date(account.lockedUntil) - new Date()) / 60000)
        return {
          ok: false,
          code: 'locked',
          message: `Too many unsuccessful attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'} or reset your password.`,
        }
      }

      if (account.password !== password) {
        const attempts = (account.failedAttempts ?? 0) + 1
        const locked = attempts >= RULES.MAX_LOGIN_ATTEMPTS
        update('accounts', account.id, {
          failedAttempts: locked ? 0 : attempts,
          lockedUntil: locked ? new Date(Date.now() + RULES.LOCK_MINUTES * 60000).toISOString() : null,
        })
        if (locked) {
          return {
            ok: false,
            code: 'locked',
            message: `Too many unsuccessful attempts. Try again in ${RULES.LOCK_MINUTES} minutes or reset your password.`,
          }
        }
        const left = RULES.MAX_LOGIN_ATTEMPTS - attempts
        return { ...invalid, attemptsLeft: left }
      }

      if (account.status === ACCOUNT_STATUS.SUSPENDED) {
        return {
          ok: false,
          code: 'suspended',
          message: 'Your account has been suspended. Contact support@internconnect.sa if you believe this is a mistake.',
        }
      }
      if (account.status === ACCOUNT_STATUS.UNVERIFIED) {
        return { ok: false, code: 'unverified', message: 'Please verify your email before logging in.', account }
      }

      update('accounts', account.id, { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date().toISOString() })
      setAccountId(account.id)
      return { ok: true, account }
    },
    [findByEmail, update],
  )

  // FR-A5
  const logout = useCallback(() => setAccountId(null), [])

  // FR-A1: creates an unverified student. Returns { ok, account } or { ok: false, field, message }
  const registerStudent = useCallback(
    ({ name, email, password, university, major }) => {
      if (findByEmail(email)) return { ok: false, field: 'email', message: 'An account with this email already exists.' }
      const id = makeId('s')
      const now = new Date().toISOString()
      const account = {
        id,
        role: ROLES.STUDENT,
        email: email.trim(),
        password,
        name: name.trim(),
        status: ACCOUNT_STATUS.UNVERIFIED,
        failedAttempts: 0,
        lockedUntil: null,
        createdAt: now,
      }
      transaction((current) => ({
        ...current,
        accounts: [account, ...current.accounts],
        students: [
          {
            id,
            name: name.trim(),
            email: email.trim(),
            phone: '',
            university,
            major,
            academicLevel: '',
            graduationDate: '',
            gpa: null,
            gpaScale: 4,
            skills: [],
            preferredCities: [],
            preferredTypes: [],
            bio: '',
            resume: null,
            notifyStatusUpdates: true,
            createdAt: now,
          },
          ...current.students,
        ],
      }))
      return { ok: true, account }
    },
    [findByEmail, transaction],
  )

  // FR-A2: company goes straight to "Pending approval" (email check is simulated)
  const registerCompany = useCallback(
    ({ companyName, crNumber, industry, city, email, contactPerson, phone, password }) => {
      if (findByEmail(email)) return { ok: false, field: 'email', message: 'An account with this email already exists.' }
      if (db.companies.some((c) => c.crNumber === crNumber.trim())) {
        return { ok: false, field: 'crNumber', message: 'This CR number is already registered.' }
      }
      const id = makeId('c')
      const now = new Date().toISOString()
      const account = {
        id,
        role: ROLES.COMPANY,
        email: email.trim(),
        password,
        name: companyName.trim(),
        status: ACCOUNT_STATUS.PENDING,
        rejectReason: '',
        failedAttempts: 0,
        lockedUntil: null,
        createdAt: now,
      }
      transaction((current) => ({
        ...current,
        accounts: [account, ...current.accounts],
        companies: [
          {
            id,
            name: companyName.trim(),
            crNumber: crNumber.trim(),
            industry,
            city,
            email: email.trim(),
            contactPerson: contactPerson.trim(),
            phone: phone.trim(),
            website: '',
            description: '',
            size: '',
            logo: null,
            submittedAt: now,
          },
          ...current.companies,
        ],
      }))
      return { ok: true, account }
    },
    [db.companies, findByEmail, transaction],
  )

  // the "click the link in the email" step of FR-A1. Logs the student in.
  const verifyEmail = useCallback(
    (id) => {
      const account = db.accounts.find((a) => a.id === id)
      if (!account) return { ok: false }
      if (account.status === ACCOUNT_STATUS.UNVERIFIED) update('accounts', id, { status: ACCOUNT_STATUS.ACTIVE })
      setAccountId(id)
      return { ok: true, account }
    },
    [db.accounts, update],
  )

  // FR-A4 step 1: always "succeeds" so we don't reveal which emails exist
  const requestPasswordReset = useCallback(
    (email) => {
      const account = findByEmail(email)
      const token = makeId('reset')
      insert('passwordResets', {
        id: token,
        accountId: account?.id ?? null,
        expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
        used: false,
      })
      return token
    },
    [findByEmail, insert],
  )

  // FR-A4 step 2. Returns { ok } or { ok: false, message }
  const resetPassword = useCallback(
    (token, newPassword) => {
      const reset = (db.passwordResets ?? []).find((r) => r.id === token)
      if (!reset || reset.used || new Date(reset.expiresAt) < new Date()) {
        return { ok: false, message: 'This reset link has expired or was already used. Request a new one.' }
      }
      update('passwordResets', token, { used: true })
      if (reset.accountId) {
        update('accounts', reset.accountId, { password: newPassword, failedAttempts: 0, lockedUntil: null })
      }
      return { ok: true }
    },
    [db.passwordResets, update],
  )

  const value = useMemo(
    () => ({
      user,
      role,
      profile,
      isLoggedIn: Boolean(user),
      login,
      logout,
      registerStudent,
      registerCompany,
      verifyEmail,
      requestPasswordReset,
      resetPassword,
      findByEmail,
    }),
    [user, role, profile, login, logout, registerStudent, registerCompany, verifyEmail, requestPasswordReset, resetPassword, findByEmail],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
