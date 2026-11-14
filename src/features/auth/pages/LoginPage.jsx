/*
  Screen 4a - Log in (FR-A3)
  States: wrong password, locked after 5 attempts (15 min), suspended, unverified email,
  pending company (goes to the waiting page). After login the user goes back to ?next= if given.
*/
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { ACCOUNT_STATUS, ROLES } from '../../../lib/constants'
import { validateEmail } from '../../../lib/validation'
import { DEMO_ACCOUNTS } from '../../../data/seed'
import { Alert, Button, Checkbox, Input } from '../../../components/ui'
import { HOME_BY_ROLE, PATHS } from '../../../routes/paths'
import AuthHeading from '../components/AuthHeading'

function afterLoginPath(account, next) {
  if (account.role === ROLES.COMPANY && account.status !== ACCOUNT_STATUS.ACTIVE) return PATHS.companyPending
  // only students are sent back to the listing they were looking at (FR-G2)
  if (next && next.startsWith('/') && account.role === ROLES.STUDENT) return next
  return HOME_BY_ROLE[account.role]
}

export default function LoginPage() {
  useDocumentTitle('Log in')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [banner, setBanner] = useState(null) // { tone, title, text, action }

  const next = params.get('next')

  // already logged in (or just logged in): go to the right place
  if (user) return <Navigate to={afterLoginPath(user, next)} replace />

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setErrors({})
    setBanner(null)
  }

  const submit = (e) => {
    e.preventDefault()
    const found = { email: validateEmail(email), password: password ? '' : 'Password is required.' }
    if (found.email || found.password) {
      setErrors(found)
      return
    }

    const result = login(email, password)
    if (!result.ok) {
      setErrors({})
      if (result.code === 'invalid') {
        const hint = result.attemptsLeft && result.attemptsLeft <= 2 ? ` ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} left.` : ''
        setErrors({ password: result.message + hint })
        setBanner(null)
      } else if (result.code === 'locked') {
        setBanner({ tone: 'danger', title: 'Account temporarily locked', text: result.message })
      } else if (result.code === 'suspended') {
        setBanner({ tone: 'danger', title: 'Your account has been suspended', text: result.message })
      } else if (result.code === 'unverified') {
        setBanner({
          tone: 'warning',
          title: 'Verify your email first',
          text: 'We sent you a verification link when you signed up.',
          action: (
            <Link to={PATHS.checkEmail(result.account.id)} className="text-xs font-semibold whitespace-nowrap text-primary hover:underline">
              Resend link
            </Link>
          ),
        })
      }
      return
    }

    toast.success(`Welcome back, ${result.account.name.split(' ')[0]}.`)
    navigate(afterLoginPath(result.account, next), { replace: true })
  }

  return (
    <>
      <AuthHeading title="Welcome back" subtitle="Log in to continue to your account." />

      <div className="mb-6 rounded-xl border border-line bg-[#efefec] px-4 py-3">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">Demo accounts</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                email === account.email ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white text-body hover:border-primary/40'
              }`}
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <Alert tone={banner.tone} title={banner.title} action={banner.action} className="mb-5">
          {banner.text}
        </Alert>
      )}

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((er) => ({ ...er, email: '' }))
          }}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((er) => ({ ...er, password: '' }))
          }}
        />
        <div className="flex items-center justify-between">
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} label="Remember me" />
          <Link to={PATHS.forgotPassword} className="text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth className="mt-1" disabled={banner?.tone === 'danger' && banner.title.includes('locked')}>
          Log in
        </Button>
        <p className="text-center text-sm text-body">
          New to InternConnect?{' '}
          <Link to={next ? `${PATHS.signup}?next=${encodeURIComponent(next)}` : PATHS.signup} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </>
  )
}
