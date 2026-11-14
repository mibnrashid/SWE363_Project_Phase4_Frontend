/*
  Screen 2 - Listing detail (FR-G2, FR-S4, FR-S6)
  States: internal vs external listing, already applied, closed/removed, guest "log in" prompt.
*/
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bookmark, BriefcaseBusiness, CheckCircle2, Clock, ExternalLink, MapPin, PlusCircle } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { getListingCompany, getStudentApplication, isListingOpen } from '../../../store/selectors'
import { useAuth } from '../../../context/authContext'
import { useSavedListings } from '../../../hooks/useSavedListings'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { APP_STATUS, LISTING_SOURCE, POSTING_STATUS, ROLES } from '../../../lib/constants'
import { daysUntil, deadlineLabel, durationLabel, formatLongDate } from '../../../lib/format'
import { cn } from '../../../lib/cn'
import { PATHS } from '../../../routes/paths'
import { Alert, Avatar, Badge, Button, EmptyState, StatusBadge } from '../../../components/ui'
import LoginPromptModal from '../../../components/listings/LoginPromptModal'
import CompanyProfileModal from '../components/CompanyProfileModal'

const PROCESS = ['Apply online', 'Screening call', 'Team interview', 'Offer']

function Section({ title, children }) {
  return (
    <section className="border-b border-line py-6 first:pt-0 last:border-0 last:pb-0">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-body">{children}</div>
    </section>
  )
}

function OverviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 text-xs last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { db } = useStore()
  const { user, role } = useAuth()
  const { isSaved, toggleSave, canSave } = useSavedListings()
  const [promptOpen, setPromptOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)

  const listing = db.listings.find((l) => l.id === id)
  useDocumentTitle(listing?.title ?? 'Listing not found')

  if (!listing) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="This listing is no longer available."
          message="It may have been removed or the link is wrong."
          action={<Button to={PATHS.home}>Browse opportunities</Button>}
        />
      </div>
    )
  }

  const company = getListingCompany(db, listing)
  const external = listing.source === LISTING_SOURCE.EXTERNAL
  const open = isListingOpen(listing)
  const removed = listing.status === POSTING_STATUS.REMOVED
  const isStudent = role === ROLES.STUDENT
  const application = isStudent ? getStudentApplication(db, user.id, listing.id) : null
  const saved = isSaved(listing.id)
  const closesSoon = open && daysUntil(listing.deadline) <= 3
  const openCount = company?.id ? db.listings.filter((l) => l.companyId === company.id && isListingOpen(l)).length : 0

  const requireStudent = (action) => {
    if (!canSave) {
      setPromptOpen(true)
      return
    }
    action()
  }

  const goBack = () => (window.history.length > 2 ? navigate(-1) : navigate(PATHS.home))

  // ---- main action button(s) ----
  let primaryAction = null
  if (role === ROLES.COMPANY || role === ROLES.ADMIN) {
    primaryAction = null // companies and admins only view listings
  } else if (external) {
    primaryAction = (
      <>
        {isStudent && (
          <Button variant="secondary" icon={PlusCircle} to={`${PATHS.student.applications}?addExternal=${listing.id}`}>
            Add to tracker
          </Button>
        )}
        <Button
          iconRight={ExternalLink}
          disabled={!open}
          onClick={() => window.open(listing.externalUrl, '_blank', 'noopener,noreferrer')}
        >
          Apply on original site
        </Button>
      </>
    )
  } else if (application) {
    primaryAction = (
      <Button icon={CheckCircle2} disabled>
        {application.status === APP_STATUS.WITHDRAWN ? 'Withdrawn' : 'Applied'}
      </Button>
    )
  } else {
    primaryAction = (
      <Button iconRight={ArrowRight} disabled={!open} onClick={() => requireStudent(() => navigate(PATHS.student.apply(listing.id)))}>
        Apply now
      </Button>
    )
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> Back to opportunities
      </button>

      {/* status messages */}
      {removed && (
        <Alert tone="danger" title="This listing is no longer available." className="mt-5">
          It was removed and is not accepting applications.
        </Alert>
      )}
      {!removed && !open && (
        <Alert tone="warning" title="This posting is no longer accepting applications." className="mt-5">
          The deadline has passed or the company closed it.
        </Alert>
      )}
      {application && (
        <Alert
          tone={application.status === APP_STATUS.WITHDRAWN ? 'warning' : 'success'}
          title={application.status === APP_STATUS.WITHDRAWN ? 'You withdrew from this posting' : 'You already applied'}
          className="mt-5"
          action={
            <Link to={PATHS.student.applications} className="text-xs font-semibold whitespace-nowrap text-primary hover:underline">
              View tracker
            </Link>
          }
        >
          Current status: <StatusBadge status={application.status} />
        </Alert>
      )}
      {external && (
        <Alert tone="info" className="mt-5">
          This listing was imported from another website. You apply on the original site, then you can add it to your tracker and update its
          status yourself.
        </Alert>
      )}

      {/* header card */}
      <header className="mt-5 flex flex-col gap-5 rounded-xl border border-line bg-white p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={company?.name ?? ''} src={company?.logo} size="lg" className="hidden sm:grid" />
          <div className="min-w-0">
            <p className="eyebrow">
              {company?.name}
              {external ? ' · External listing' : ' · Verified company'}
            </p>
            <h1 className="mt-1.5 text-3xl leading-tight sm:text-[34px]">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {listing.city || 'City not set'}
              </span>
              <span className="flex items-center gap-1.5">
                <BriefcaseBusiness className="size-3.5" />
                {listing.trainingType}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {durationLabel(listing.durationWeeks)}
              </span>
              {closesSoon && <Badge tone="danger">{deadlineLabel(listing.deadline)}</Badge>}
              {external && (
                <Badge tone="info" icon={ExternalLink}>
                  External
                </Badge>
              )}
            </div>
          </div>
        </div>
        {role !== ROLES.COMPANY && role !== ROLES.ADMIN && (
          <div className="flex flex-wrap gap-2 md:shrink-0">
            <Button
              variant="secondary"
              icon={Bookmark}
              onClick={() => requireStudent(() => toggleSave(listing.id))}
              className={cn(saved && 'border-primary text-primary [&_svg]:fill-current')}
              disabled={removed}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
            {primaryAction}
          </div>
        )}
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_310px]">
        {/* details */}
        <div className="rounded-xl border border-line bg-white p-5 sm:p-7">
          <Section title="About the opportunity">
            <p>{listing.description || listing.summary}</p>
          </Section>
          {listing.responsibilities?.length > 0 && (
            <Section title="What you'll do">
              <ul className="list-disc space-y-1.5 pl-5">
                {listing.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Section>
          )}
          {listing.requirements?.length > 0 && (
            <Section title="What we're looking for">
              <ul className="list-disc space-y-1.5 pl-5">
                {listing.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Section>
          )}
          {listing.skills?.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {listing.skills.map((s) => (
                  <Badge key={s} tone="teal">
                    {s}
                  </Badge>
                ))}
              </div>
            </Section>
          )}
          {!external && (
            <Section title="Application process">
              <ol className="mt-2 grid grid-cols-2 gap-y-5 sm:grid-cols-4">
                {PROCESS.map((step, i) => (
                  <li key={step} className="relative flex flex-col items-center text-center">
                    {i < PROCESS.length - 1 && <span className="absolute top-3.5 left-1/2 hidden h-px w-full bg-line sm:block" />}
                    <span className="relative grid size-7 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="mt-2 text-xs font-medium text-ink">{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        {/* sidebar */}
        <aside className="flex flex-col gap-5">
          <div className="rounded-xl border border-line bg-white p-5">
            <h2 className="text-xl font-bold">Opportunity overview</h2>
            <dl className="mt-3">
              <OverviewRow label="Start date" value={listing.startDate ? formatLongDate(listing.startDate) : 'To be confirmed'} />
              <OverviewRow label="Duration" value={durationLabel(listing.durationWeeks)} />
              <OverviewRow label="Work mode" value={listing.workMode} />
              <OverviewRow
                label="Compensation"
                value={listing.paid ? (listing.stipend ? `Paid · SAR ${listing.stipend}/month` : 'Paid') : 'Unpaid'}
              />
              <OverviewRow label="Application deadline" value={formatLongDate(listing.deadline)} />
              {!external && <OverviewRow label="Openings" value={listing.openings} />}
              {listing.majors?.length > 0 && <OverviewRow label="Eligible majors" value={listing.majors.join(', ')} />}
            </dl>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar name={company?.name ?? ''} src={company?.logo} />
              <div>
                <p className="font-serif text-xl font-bold">{company?.name}</p>
                <p className="text-[11px] text-muted">
                  {external ? 'Imported listing' : [company?.industry, company?.size].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            {!external && (
              <button
                type="button"
                onClick={() => setCompanyOpen(true)}
                className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-ink hover:bg-canvas"
              >
                View company profile
              </button>
            )}
          </div>
        </aside>
      </div>

      <LoginPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
      <CompanyProfileModal open={companyOpen} onClose={() => setCompanyOpen(false)} company={company} openCount={openCount} />
    </div>
  )
}
