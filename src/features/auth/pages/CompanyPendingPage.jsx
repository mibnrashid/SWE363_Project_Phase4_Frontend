/*
  Screen 5 - Company pending / rejected (FR-A2, FR-AD1)
  Pending: "Waiting for approval", cannot post.
  Rejected: shows the admin's reason, company can fix its details and resubmit.
*/
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Check, Clock, X } from 'lucide-react'
import { useAuth } from '../../../context/authContext'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { ACCOUNT_STATUS, CITIES, INDUSTRIES } from '../../../lib/constants'
import { formatDateTime } from '../../../lib/format'
import { isValid, required, validateCR } from '../../../lib/validation'
import { cn } from '../../../lib/cn'
import { Button, Input, Select } from '../../../components/ui'
import { PATHS } from '../../../routes/paths'

function DetailsTable({ company }) {
  const rows = [
    ['Company name', company.name],
    ['CR number', company.crNumber],
    ['Industry', company.industry],
    ['City', company.city],
    ['Contact email', company.email],
  ]
  return (
    <div className="rounded-xl border border-line px-4 py-3 text-left">
      <p className="font-serif text-lg font-bold">Submitted details</p>
      <dl className="mt-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-t border-line py-2 text-xs">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-semibold break-all text-ink">{value || '-'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Steps({ submittedAt }) {
  const steps = [
    { label: 'Request submitted', note: formatDateTime(submittedAt), done: true },
    { label: 'Admin review', note: 'In progress' },
    { label: 'Decision', note: "We'll email you" },
  ]
  return (
    <ol className="mt-7 grid grid-cols-3 gap-2">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex flex-col items-center text-center">
          {i < steps.length - 1 && <span className="absolute top-4 left-[calc(50%+24px)] h-px w-[calc(100%-48px)] bg-line" />}
          <span
            className={cn(
              'grid size-8 place-items-center rounded-full border text-xs font-semibold',
              s.done ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink',
            )}
          >
            {s.done ? <Check className="size-4" /> : i + 1}
          </span>
          <span className="mt-2 text-xs font-semibold text-ink">{s.label}</span>
          <span className="mt-0.5 text-[11px] text-muted">{s.note}</span>
        </li>
      ))}
    </ol>
  )
}

export default function CompanyPendingPage() {
  const { user, profile, logout } = useAuth()
  const { db, transaction } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const rejected = user?.status === ACCOUNT_STATUS.REJECTED
  useDocumentTitle(rejected ? 'Company not approved' : 'Waiting for approval')

  // approved while this page was open -> go to the dashboard
  if (user?.status === ACCOUNT_STATUS.ACTIVE) return <Navigate to={PATHS.company.dashboard} replace />
  if (!profile) return null

  const doLogout = () => {
    logout()
    navigate(PATHS.home)
  }

  const startEdit = () => {
    setForm({ name: profile.name, crNumber: profile.crNumber, industry: profile.industry, city: profile.city, contactPerson: profile.contactPerson })
    setErrors({})
    setEditing(true)
  }

  const resubmit = (e) => {
    e.preventDefault()
    const found = {
      name: required(form.name, 'Company name is required.'),
      crNumber:
        validateCR(form.crNumber) ||
        (db.companies.some((c) => c.id !== profile.id && c.crNumber === form.crNumber.trim()) ? 'This CR number is already registered.' : ''),
      industry: required(form.industry, 'Select an industry.'),
      city: required(form.city, 'Select a city.'),
      contactPerson: required(form.contactPerson, 'Contact person is required.'),
    }
    if (!isValid(found)) {
      setErrors(found)
      return
    }
    const now = new Date().toISOString()
    transaction((current) => ({
      ...current,
      companies: current.companies.map((c) => (c.id === profile.id ? { ...c, ...form, name: form.name.trim(), crNumber: form.crNumber.trim(), submittedAt: now } : c)),
      accounts: current.accounts.map((a) => (a.id === user.id ? { ...a, name: form.name.trim(), status: ACCOUNT_STATUS.PENDING, rejectReason: '' } : a)),
    }))
    setEditing(false)
    toast.success('Your request was sent again.')
  }

  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      setErrors((er) => ({ ...er, [key]: '' }))
    },
  })

  return (
    <div className="mx-auto max-w-[616px] pb-6">
      <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-[0_10px_40px_rgba(29,37,35,0.06)] sm:p-12">
        <div
          className={cn(
            'mx-auto grid size-12 place-items-center rounded-full',
            rejected ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary',
          )}
        >
          {rejected ? <X className="size-6" /> : <Clock className="size-6" />}
        </div>
        <p className="eyebrow mt-4">{rejected ? 'Application not approved' : 'Verification in progress'}</p>
        <h1 className="mt-2 text-3xl leading-tight font-bold sm:text-[32px]">
          {rejected ? "We couldn't approve your company" : 'Waiting for approval'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-body">
          {rejected
            ? 'Your submitted details need an update before they can be approved.'
            : 'Your company account is pending admin review. This usually takes up to 2 business days. You can post opportunities once you are approved.'}
        </p>

        {editing ? (
          <form onSubmit={resubmit} noValidate className="mt-7 flex flex-col gap-4 text-left">
            <Input label="Company name" {...field('name')} />
            <Input label="Commercial Registration (CR)" inputMode="numeric" maxLength={10} {...field('crNumber')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Industry" placeholder="Select industry" options={INDUSTRIES} {...field('industry')} />
              <Select label="City" placeholder="Select city" options={CITIES} {...field('city')} />
            </div>
            <Input label="Contact person" {...field('contactPerson')} />
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Resubmit for approval</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-7">
              <DetailsTable company={profile} />
            </div>

            {rejected ? (
              <div className="mt-5 rounded-lg border border-danger/20 border-l-4 border-l-danger bg-danger-soft px-4 py-3 text-left">
                <p className="text-sm font-semibold text-ink">Admin&apos;s reason</p>
                <p className="mt-1 text-[13px] text-body">{user.rejectReason || 'No reason was given.'}</p>
              </div>
            ) : (
              <Steps submittedAt={profile.submittedAt} />
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {rejected ? (
                <Button size="lg" onClick={startEdit}>
                  Edit details and resubmit
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => toast.info('Still waiting for an admin to review your request.')}
                >
                  Check status
                </Button>
              )}
              <Button size="lg" variant="ghost" onClick={doLogout}>
                Log out
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
