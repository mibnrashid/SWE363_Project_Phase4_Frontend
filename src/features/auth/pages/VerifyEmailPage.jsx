/*
  FR-A1 step 6: the user clicked the email link -> account becomes Active
  and they are taken to complete their profile. Links expire after 24 hours.
*/
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '../../../context/authContext'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { ACCOUNT_STATUS } from '../../../lib/constants'
import { Button } from '../../../components/ui'
import { PATHS } from '../../../routes/paths'

const DAY = 24 * 60 * 60 * 1000

export default function VerifyEmailPage() {
  useDocumentTitle('Verify your email')
  const { accountId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { verifyEmail } = useAuth()
  const { db, update } = useStore()
  const [done, setDone] = useState(false)

  const account = db.accounts.find((a) => a.id === accountId)
  const expired = account?.status === ACCOUNT_STATUS.UNVERIFIED && Date.now() - new Date(account.createdAt).getTime() > DAY

  if (!account) {
    return (
      <Card icon={Clock} tone="warning" title="This link is not valid" text="The account could not be found.">
        <Button to={PATHS.signup}>Create an account</Button>
      </Card>
    )
  }

  if (expired) {
    return (
      <Card icon={Clock} tone="warning" title="This link has expired" text="Verification links are valid for 24 hours.">
        <Button
          onClick={() => {
            update('accounts', account.id, { createdAt: new Date().toISOString() })
            toast.success('We sent a new verification link.')
            navigate(PATHS.checkEmail(account.id))
          }}
        >
          Resend link
        </Button>
      </Card>
    )
  }

  if (!done) {
    return (
      <Card icon={CheckCircle2} title="Confirm your email" text={`Confirm ${account.email} to activate your account.`}>
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            verifyEmail(account.id)
            setDone(true)
          }}
        >
          Verify my email
        </Button>
      </Card>
    )
  }

  const next = params.get('next')
  return (
    <Card icon={CheckCircle2} title="Your account is ready." text="Complete your profile so companies can learn about you and we can suggest matching training.">
      <div className="flex flex-col gap-2">
        <Button size="lg" fullWidth to={PATHS.student.profile}>
          Complete your profile
        </Button>
        {next && (
          <Button size="lg" variant="secondary" fullWidth to={next}>
            Back to the listing
          </Button>
        )}
      </div>
    </Card>
  )
}

function Card({ icon: Icon, tone = 'teal', title, text, children }) {
  const color = tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-primary-soft text-primary'
  return (
    <div className="rounded-xl border border-line bg-white p-6 text-center sm:p-10">
      <div className={`mx-auto grid size-14 place-items-center rounded-full ${color}`}>
        <Icon className="size-6" />
      </div>
      <h1 className="mt-5 text-3xl font-bold">{title}</h1>
      <p className="mx-auto mt-2 mb-7 max-w-sm text-sm text-body">{text}</p>
      {children}
    </div>
  )
}
