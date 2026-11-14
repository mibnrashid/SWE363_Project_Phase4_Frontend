import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, Clock, ExternalLink, MapPin } from 'lucide-react'
import { Avatar, Badge } from '../../../components/ui'
import { LISTING_SOURCE } from '../../../lib/constants'
import { daysUntil, deadlineLabel, durationLabel } from '../../../lib/format'
import { cn } from '../../../lib/cn'
import { PATHS } from '../../../routes/paths'

/**
 * Wide result row of the student search page (prototype "Find opportunities").
 * Never shows match labels or scores (Phase 3 rule for search).
 */
export default function SearchResultRow({ listing, companyName, companyLogo, saved, onToggleSave }) {
  const external = listing.source === LISTING_SOURCE.EXTERNAL
  const closingSoon = daysUntil(listing.deadline) <= 3

  return (
    <article className="rounded-xl border border-line bg-white p-4 transition-shadow hover:shadow-[0_6px_24px_rgba(29,37,35,0.07)] sm:p-5">
      <div className="flex gap-4">
        <Avatar name={companyName} text={companyName.length <= 3 ? companyName : undefined} src={companyLogo} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-primary">{companyName}</p>
          <h3 className="mt-0.5 text-[19px] leading-snug font-bold">
            <Link to={PATHS.listing(listing.id)} className="hover:text-primary">
              {listing.title}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {listing.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {durationLabel(listing.durationWeeks)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge>{listing.trainingType}</Badge>
            <Badge>{listing.workMode}</Badge>
            <Badge>{listing.paid ? 'Paid' : 'Unpaid'}</Badge>
            {external && (
              <Badge tone="info" icon={ExternalLink}>
                External
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 sm:ml-14">
        <span className={cn('text-[11px]', closingSoon ? 'font-semibold text-danger' : 'text-muted')}>{deadlineLabel(listing.deadline)}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved' : 'Save listing'}
            className={cn(
              'grid size-8 place-items-center rounded-lg border transition-colors',
              saved ? 'border-primary bg-primary text-white' : 'border-line text-ink hover:bg-canvas',
            )}
          >
            <Bookmark className={cn('size-4', saved && 'fill-current')} />
          </button>
          <Link to={PATHS.listing(listing.id)} className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
            View details <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
