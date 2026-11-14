import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, ExternalLink, MapPin } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { LISTING_SOURCE } from '../../lib/constants'
import { daysUntil, deadlineLabel, durationLabel, timeAgo } from '../../lib/format'
import { cn } from '../../lib/cn'
import { PATHS } from '../../routes/paths'

/**
 * Opportunity card from the prototype (landing grid, search results, recommendations).
 *
 * <ListingCard
 *   listing={listing}
 *   companyName="Aramco Digital"
 *   companyLogo={company.logo}       // optional
 *   saved={isSaved(listing.id)}
 *   onToggleSave={() => ...}          // leave out to hide the bookmark button
 *   matchLabel="Strong match"         // optional, students only (FR-S3)
 *   showDeadline                      // footer shows "Closes in 2 days" instead of "2 days ago"
 * />
 */
export default function ListingCard({ listing, companyName, companyLogo, saved, onToggleSave, matchLabel, showDeadline = false }) {
  const external = listing.source === LISTING_SOURCE.EXTERNAL
  const closingSoon = daysUntil(listing.deadline) <= 3

  return (
    <article className="flex flex-col rounded-xl border border-line bg-white p-5 transition-shadow hover:shadow-[0_6px_24px_rgba(29,37,35,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <Avatar name={companyName} text={companyName.length <= 3 ? companyName : undefined} src={companyLogo} />
        <div className="flex items-center gap-2">
          {matchLabel && <Badge tone={matchLabel === 'Strong match' ? 'teal' : 'neutral'}>{matchLabel}</Badge>}
          {onToggleSave && (
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
          )}
        </div>
      </div>

      <p className="mt-5 text-[11px] font-semibold text-primary">{companyName}</p>
      <h3 className="mt-1 text-[19px] leading-snug font-bold">
        <Link to={PATHS.listing(listing.id)} className="hover:text-primary">
          {listing.title}
        </Link>
      </h3>
      {listing.summary && <p className="mt-2 line-clamp-2 text-[13px] text-body">{listing.summary}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge>{listing.trainingType}</Badge>
        <Badge>{durationLabel(listing.durationWeeks)}</Badge>
        <Badge>{listing.workMode}</Badge>
        {external && (
          <Badge tone="info" icon={ExternalLink}>
            External
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {listing.city}
        </span>
        <span>{listing.paid ? 'Paid' : 'Unpaid'}</span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-[11px]">
        {showDeadline ? (
          <span className={cn(closingSoon ? 'font-medium text-danger' : 'text-muted')}>{deadlineLabel(listing.deadline)}</span>
        ) : (
          <span className="text-muted">{timeAgo(listing.postedAt)}</span>
        )}
        <Link to={PATHS.listing(listing.id)} className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
          View details <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}
