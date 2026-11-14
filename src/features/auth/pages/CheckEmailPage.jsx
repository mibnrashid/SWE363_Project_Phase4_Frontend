/*
  FR-A1 step 5: "Check your email to verify your account."
  There is no real email in the prototype, so a demo button opens the verification link.
*/
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { Alert, Button } from '../../../components/ui'
import { PATHS } from '../../../routes/paths'
import AuthHeading from '../components/AuthHeading'

export default function CheckEmailPage() {
  useDocumentTitle('Check your email')
  const { accountId } = useParams()
  const [params] = useSearchParams()
  const { db, update } = useStore()
  const toast = useToast()
  const account = db.accounts.find((a) => a.id === accountId)
  const next = params.get('next')

  if (!account) {
    return (
      <>
        <AuthHeading title="Link not found" subtitle="We couldn't find this account." />
        <Button to={PATHS.signup}>Create an account</Button>
      </>
    )
  }

  const resend = () => {
    // a new link restarts the 24 hour window
    update('accounts', account.id, { createdAt: new Date().toISOString() })
    toast.success('We sent a new verification link.')
  }

  return (
    <>
      <AuthHeading title="Check your inbox" subtitle={`We sent a verification link to ${account.email}.`} />
      <div className="rounded-xl border border-line bg-white p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <MailCheck className="size-5" />
        </div>
        <p className="mt-4 text-sm text-body">Check your email to verify your account. The link expires in 24 hours.</p>
        <Button
          fullWidth
          size="lg"
          className="mt-5"
          to={`${PATHS.verifyEmail(account.id)}${next ? `?next=${encodeURIComponent(next)}` : ''}`}
        >
          Open verification link
        </Button>
        <button type="button" onClick={resend} className="mt-4 text-sm font-semibold text-ink hover:text-primary">
          Resend link
        </button>
      </div>
      <Alert tone="info" className="mt-4">
        Demo only: there is no email server in this prototype, so the button above stands in for the link in the email.
      </Alert>
      <p className="mt-6 text-center text-sm text-body">
        Wrong email?{' '}
        <Link to={PATHS.signup} className="font-semibold text-primary hover:underline">
          Sign up again
        </Link>
      </p>
    </>
  )
}
