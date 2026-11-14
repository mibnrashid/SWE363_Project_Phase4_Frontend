/*
  Screen 4b - Forgot password (FR-A4 step 1)
  Same message whether or not the email exists. The reset link is valid for 30 minutes.
*/
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { validateEmail } from '../../../lib/validation'
import { Alert, Button, Input } from '../../../components/ui'
import { PATHS } from '../../../routes/paths'
import AuthHeading from '../components/AuthHeading'

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot your password?')
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    const message = validateEmail(email)
    if (message) {
      setError(message)
      return
    }
    setToken(requestPasswordReset(email))
  }

  if (token) {
    return (
      <>
        <AuthHeading title="Check your inbox" subtitle="If this email is registered, we've sent a reset link." />
        <div className="rounded-xl border border-line bg-white p-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
            <Mail className="size-5" />
          </div>
          <p className="mt-4 text-xs text-muted">The link expires in 30 minutes. Check your spam folder if you don&apos;t see it.</p>
          <Button fullWidth size="lg" className="mt-5" to={PATHS.resetPassword(token)}>
            Open reset link
          </Button>
          <Link to={PATHS.login} className="mt-4 inline-block text-sm font-semibold text-ink hover:text-primary">
            Back to login
          </Link>
        </div>
        <Alert tone="info" className="mt-4">
          Demo only: there is no email server in this prototype, so the button above stands in for the link in the email.
        </Alert>
      </>
    )
  }

  return (
    <>
      <AuthHeading title="Forgot your password?" subtitle="Enter your email and we'll send you a secure reset link." />
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          error={error}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
        />
        <Button type="submit" size="lg" fullWidth>
          Send reset link
        </Button>
        <Link to={PATHS.login} className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> Back to login
        </Link>
      </form>
    </>
  )
}
