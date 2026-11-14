/*
  Screen 4c - Create a new password (FR-A4 steps 3-4)
  Link is single use and valid for 30 minutes. New password follows the FR-A1 rules.
*/
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { isValid, validateConfirm, validatePassword } from '../../../lib/validation'
import { Alert, Button, Input } from '../../../components/ui'
import { PATHS } from '../../../routes/paths'
import AuthHeading from '../components/AuthHeading'

export default function ResetPasswordPage() {
  useDocumentTitle('Create a new password')
  const { token } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { resetPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [linkError, setLinkError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const found = { password: validatePassword(password), confirm: validateConfirm(password, confirm) }
    if (!isValid(found)) {
      setErrors(found)
      return
    }
    const result = resetPassword(token, password)
    if (!result.ok) {
      setLinkError(result.message)
      return
    }
    toast.success('Password updated. Please log in.')
    navigate(PATHS.login)
  }

  return (
    <>
      <AuthHeading title="Create a new password" subtitle="Choose a strong password you haven't used before." />
      {linkError && (
        <Alert
          tone="danger"
          title="Reset link not valid"
          className="mb-5"
          action={
            <Link to={PATHS.forgotPassword} className="text-xs font-semibold whitespace-nowrap text-primary hover:underline">
              Request a new link
            </Link>
          }
        >
          {linkError}
        </Alert>
      )}
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          hint="Use 8+ characters, including a letter and a number."
          autoComplete="new-password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((er) => ({ ...er, password: '' }))
          }}
        />
        <Input
          label="Confirm new password"
          type="password"
          icon={Lock}
          placeholder="Repeat your new password"
          autoComplete="new-password"
          value={confirm}
          error={errors.confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            setErrors((er) => ({ ...er, confirm: '' }))
          }}
        />
        <Button type="submit" size="lg" fullWidth>
          Reset password
        </Button>
        <Link to={PATHS.login} className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> Back to login
        </Link>
      </form>
    </>
  )
}
