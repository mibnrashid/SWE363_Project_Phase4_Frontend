/*
  Screen 11 - Apply (FR-S4)
  The prototype shows this as a popup on the listing page; here it is its own page styled like that popup.
  Checks (in order): listing missing / external, already applied, posting closed, profile incomplete.
  Then: required screening questions -> confirm -> application saved -> success state.
*/
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CircleCheck, FileText } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { getListing, getListingCompany, getStudentApplication, isListingOpen } from '../../../store/selectors'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { APP_STATUS, LISTING_SOURCE } from '../../../lib/constants'
import { makeId } from '../../../lib/ids'
import { PATHS } from '../../../routes/paths'
import { Alert, Button, ConfirmDialog, EmptyState, Select, StatusBadge, Textarea } from '../../../components/ui'

const RESUME_STATUS_TEXT = {
  analysed: 'Resume analysed',
  pending: 'Analysis pending',
  unreadable: "We couldn't read this file",
}

function Panel({ title, children }) {
  return (
    <section className="rounded-xl border border-line bg-white p-4 sm:p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-semibold text-ink" title={value}>
        {value || '-'}
      </p>
    </div>
  )
}

// centered card that looks like the prototype popup
function Shell({ children }) {
  return <div className="mx-auto max-w-[720px] pb-6">{children}</div>
}

function BlockedState({ listing, title, message, action }) {
  return (
    <Shell>
      {listing && (
        <Link to={PATHS.listing(listing.id)} className="flex items-center gap-1.5 text-xs text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" /> Back to listing
        </Link>
      )}
      <div className="mt-4 rounded-2xl border border-line bg-white">
        <EmptyState title={title} message={message} action={action} />
      </div>
    </Shell>
  )
}

export default function ApplyPage() {
  const { listingId } = useParams()
  const { db, insert } = useStore()
  const { user, profile } = useAuth()
  const toast = useToast()

  const listing = getListing(db, listingId)
  useDocumentTitle(listing ? `Apply - ${listing.title}` : 'Apply')

  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // ---- success state (checked first: after submitting, the application exists) ----
  if (submitted) {
    return (
      <Shell>
        <div className="flex flex-col items-center rounded-2xl border border-line bg-white px-6 py-12 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-7" />
          </div>
          <h1 className="mt-4 text-3xl">Application submitted</h1>
          <p className="mt-2 max-w-sm text-sm text-body">
            You applied to {listing?.title}. You can follow its status in your tracker.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button to={PATHS.student.applications}>View my applications</Button>
            <Button variant="secondary" to={PATHS.student.search}>
              Browse more
            </Button>
          </div>
        </div>
      </Shell>
    )
  }

  // ---- checks before showing the form ----
  if (!listing || listing.source === LISTING_SOURCE.EXTERNAL) {
    return (
      <BlockedState
        listing={listing}
        title={listing ? 'Apply on the original website' : 'This listing is no longer available.'}
        message={
          listing
            ? 'This listing was imported from another site. Apply there, then add it to your tracker.'
            : 'It may have been removed or the link is wrong.'
        }
        action={<Button to={listing ? PATHS.listing(listing.id) : PATHS.student.search}>{listing ? 'Back to listing' : 'Find opportunities'}</Button>}
      />
    )
  }

  const existing = getStudentApplication(db, user.id, listing.id)
  if (existing) {
    return (
      <BlockedState
        listing={listing}
        title="You already applied"
        message={
          <>
            You can apply only once to each posting. Current status: <StatusBadge status={existing.status} />
          </>
        }
        action={<Button to={PATHS.student.applications}>View my applications</Button>}
      />
    )
  }

  if (!isListingOpen(listing)) {
    return (
      <BlockedState
        listing={listing}
        title="This posting is no longer accepting applications."
        message="The deadline has passed or the company closed it."
        action={<Button to={PATHS.student.search}>Find other opportunities</Button>}
      />
    )
  }

  const company = getListingCompany(db, listing)
  const companyName = company?.name ?? ''
  const missing = [
    !profile.university && 'university',
    !profile.major && 'major',
    !profile.graduationDate && 'expected graduation',
    !profile.resume && 'resume',
  ].filter(Boolean)
  const questions = listing.screeningQuestions ?? []

  const review = () => {
    const found = {}
    for (const q of questions) {
      if (q.required && !String(answers[q.id] ?? '').trim()) found[q.id] = 'This question is required.'
    }
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Please answer the required questions.')
      return
    }
    setConfirmOpen(true)
  }

  const submit = () => {
    const now = new Date().toISOString()
    const cleanAnswers = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, String(v).trim()]).filter(([, v]) => v))
    insert('applications', {
      id: makeId('app'),
      listingId: listing.id,
      studentId: user.id,
      status: APP_STATUS.APPLIED,
      appliedAt: now,
      answers: cleanAnswers,
      history: [{ status: APP_STATUS.APPLIED, at: now, note: '' }],
      external: false,
    })
    setConfirmOpen(false)
    setSubmitted(true)
    toast.success('Application submitted.')
  }

  const gpa = profile.gpa != null && profile.gpa !== '' ? `${profile.gpa} / ${Number(profile.gpaScale ?? 4).toFixed(1)}` : '-'

  return (
    <Shell>
      <Link to={PATHS.listing(listing.id)} className="flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> Back to listing
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_40px_rgba(29,37,35,0.08)]">
        <header className="border-b border-line px-5 py-5 sm:px-6">
          <p className="eyebrow">Application</p>
          <h1 className="mt-1.5 text-[28px] leading-tight sm:text-[32px]">{listing.title}</h1>
          <p className="mt-1 text-xs text-muted">
            {companyName} · {listing.city}
          </p>
        </header>

        <div className="flex flex-col gap-4 bg-canvas/60 px-4 py-5 sm:px-6">
          {missing.length > 0 ? (
            <Alert
              tone="warning"
              title="Complete your profile before applying"
              action={
                <Button size="sm" to={PATHS.student.profile}>
                  Complete profile
                </Button>
              }
            >
              Add your {missing.join(', ')} so {companyName} can review your application.
            </Alert>
          ) : (
            <>
              <Panel title="Profile summary">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <SummaryItem label="Student" value={profile.name} />
                  <SummaryItem label="University" value={profile.university} />
                  <SummaryItem label="Major" value={profile.major} />
                  <SummaryItem label="GPA" value={gpa} />
                </div>
                <Link to={PATHS.student.profile} className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
                  Edit profile
                </Link>
              </Panel>

              <Panel title="Resume">
                <div className="flex items-center gap-3 rounded-lg border border-line px-3 py-3">
                  <FileText className="size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{profile.resume.fileName}</p>
                    <p className="text-[11px] text-muted">{RESUME_STATUS_TEXT[profile.resume.status] ?? ''}</p>
                  </div>
                  {profile.resume.status === 'analysed' && <CircleCheck className="size-4 shrink-0 text-primary" />}
                </div>
              </Panel>

              {questions.length > 0 && (
                <Panel title="Screening questions">
                  <div className="flex flex-col gap-4">
                    {questions.map((q) =>
                      q.type === 'yesno' ? (
                        <Select
                          key={q.id}
                          label={q.text}
                          required={q.required}
                          placeholder="Select an answer"
                          options={['Yes', 'No']}
                          value={answers[q.id] ?? ''}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          error={errors[q.id]}
                        />
                      ) : (
                        <Textarea
                          key={q.id}
                          label={q.text}
                          required={q.required}
                          rows={3}
                          maxLength={500}
                          placeholder="Write your answer"
                          value={answers[q.id] ?? ''}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          error={errors[q.id]}
                        />
                      ),
                    )}
                  </div>
                </Panel>
              )}
            </>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[11px] text-muted">By applying, you agree to share your profile with {companyName}.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" to={PATHS.listing(listing.id)}>
              Cancel
            </Button>
            <Button onClick={review} disabled={missing.length > 0}>
              Review &amp; submit
            </Button>
          </div>
        </footer>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit application?"
        message={`Your profile, resume and answers will be shared with ${companyName}. You can apply only once to this posting.`}
        confirmLabel="Submit application"
        onConfirm={submit}
        onCancel={() => setConfirmOpen(false)}
      />
    </Shell>
  )
}
