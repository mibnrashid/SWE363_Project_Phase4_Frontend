/*
  Screen 9 - Saved opportunities (FR-S6, FR-S7)
  States: reminder on/off, closes soon (no reminder under 2 days), already applied,
  closed / removed listing (greyed), empty.
*/
import { Bookmark, Trash2 } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { getListing, getListingCompany, getStudentApplication, isListingOpen } from '../../../store/selectors'
import { useAuth } from '../../../context/authContext'
import { useSavedListings } from '../../../hooks/useSavedListings'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { LISTING_SOURCE, RULES } from '../../../lib/constants'
import { daysUntil, durationLabel, formatLongDate } from '../../../lib/format'
import { cn } from '../../../lib/cn'
import { PATHS } from '../../../routes/paths'
import { Avatar, Badge, Button, EmptyState, PageHeader, StatusBadge, Toggle } from '../../../components/ui'

const SMALL_CAPS = 'text-[10px] tracking-wide uppercase'

function SavedCard({ saved, listing, company, application, onRemove, onReminder }) {
  const open = listing && isListingOpen(listing)
  const days = listing ? daysUntil(listing.deadline) : -1
  const tooClose = open && days < RULES.REMINDER_DAYS_BEFORE
  const closesSoon = open && days <= 3
  const external = listing?.source === LISTING_SOURCE.EXTERNAL
  const companyName = company?.name ?? ''

  let footerLeft
  if (!open) {
    footerLeft = (
      <p className="text-[11px] text-muted">
        {listing ? `Applications closed on ${formatLongDate(listing.deadline)}` : 'This listing was removed.'}
      </p>
    )
  } else if (application) {
    footerLeft = (
      <div className="flex items-center gap-2 text-xs text-body">
        You applied · <StatusBadge status={application.status} />
      </div>
    )
  } else if (tooClose) {
    footerLeft = <p className="text-xs font-medium text-danger">Too close to the deadline for a reminder</p>
  } else {
    footerLeft = (
      <div className="flex items-center gap-3">
        <Toggle checked={Boolean(saved.reminder)} onChange={onReminder} label={`Remind me ${RULES.REMINDER_DAYS_BEFORE} days before`} />
        <div>
          <p className="text-xs font-semibold text-ink">Remind me {RULES.REMINDER_DAYS_BEFORE} days before</p>
          <p className="text-[11px] text-muted">We&apos;ll send an in-app notification</p>
        </div>
      </div>
    )
  }

  return (
    <article className={cn('overflow-hidden rounded-xl border border-line bg-white', !open && 'opacity-60')}>
      <div className="flex gap-4 p-4 sm:p-5">
        <Avatar name={companyName} text={companyName.length <= 3 ? companyName : undefined} src={company?.logo} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {!open && <Badge className={SMALL_CAPS}>Closed</Badge>}
            {closesSoon && (
              <Badge tone="danger" className={SMALL_CAPS}>
                Closes soon · {days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'}`}
              </Badge>
            )}
            {external && (
              <Badge tone="info" className={SMALL_CAPS}>
                External
              </Badge>
            )}
          </div>
          <h2 className="mt-1.5 text-xl leading-snug font-bold">{listing?.title ?? 'Listing no longer available'}</h2>
          {listing && (
            <>
              <p className="mt-0.5 text-xs text-muted">
                {[companyName, listing.city, listing.trainingType].filter(Boolean).join(' · ')}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge>{durationLabel(listing.durationWeeks)}</Badge>
                <Badge>{listing.workMode}</Badge>
                <Badge>{listing.paid ? 'Paid' : 'Unpaid'}</Badge>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/60 px-4 py-3 sm:px-5">
        {footerLeft}
        <div className="flex items-center gap-2">
          {open ? (
            <Button variant="secondary" to={PATHS.listing(listing.id)}>
              View listing
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Listing closed
            </Button>
          )}
          <Button variant="secondary" aria-label="Remove from saved" onClick={onRemove} className="w-10 px-0">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function SavedPage() {
  useDocumentTitle('Saved opportunities')
  const { db } = useStore()
  const { user } = useAuth()
  const { savedRows, toggleSave, setReminder } = useSavedListings()

  const rows = [...savedRows].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))

  return (
    <div className="pb-4">
      <PageHeader eyebrow="Student workspace" title="Saved opportunities" subtitle="Keep track of opportunities you're considering." />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon={Bookmark}
            title="You haven't saved any listings yet"
            message="Save opportunities to come back to them later and get a reminder before they close."
            action={<Button to={PATHS.student.search}>Search listings</Button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((saved) => {
            const listing = getListing(db, saved.listingId)
            return (
              <SavedCard
                key={saved.id}
                saved={saved}
                listing={listing}
                company={getListingCompany(db, listing)}
                application={listing ? getStudentApplication(db, user.id, listing.id) : null}
                onRemove={() => toggleSave(saved.listingId)}
                onReminder={(on) => setReminder(saved.id, on)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
