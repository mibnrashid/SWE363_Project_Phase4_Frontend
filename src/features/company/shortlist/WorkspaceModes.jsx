/*
  The two small modes of the shortlist workspace (screen 16):
   - LockedCard: posting still open
   - ApprovedCard: shortlist already approved
*/
import { CheckCircle2, Lock } from 'lucide-react'
import { Button } from '../../../components/ui'
import { formatLongDate } from '../../../lib/format'
import { APP_STATUS } from '../../../lib/constants'
import { PATHS } from '../../../routes/paths'

function SkeletonBox({ rows, className }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={i % 2 === 0 ? 'h-4 bg-[#f4f4f1]' : 'h-4 bg-white'} />
      ))}
    </div>
  )
}

export function LockedCard() {
  return (
    <section className="mt-8 rounded-2xl border border-line bg-white px-6 py-14 text-center sm:py-20">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
        <Lock className="size-4" />
      </div>
      <h2 className="mt-4 text-xl font-bold sm:text-2xl">Applicants can be shortlisted after the posting closes</h2>
      <p className="mt-1.5 text-sm text-muted">
        Applications are still arriving. Tables and assistant chat will unlock when you close the posting.
      </p>
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-[2fr_1fr] gap-3 opacity-70">
        <SkeletonBox rows={6} className="overflow-hidden rounded-lg border border-line" />
        <SkeletonBox rows={6} className="overflow-hidden rounded-lg border border-line" />
      </div>
    </section>
  )
}

export function ApprovedCard({ listing, applications }) {
  const count = applications.filter(
    (a) => a.status === APP_STATUS.SHORT_LISTED || a.status === APP_STATUS.ACCEPTED,
  ).length
  return (
    <section className="mt-8 flex flex-col gap-4 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="font-serif text-lg font-bold">Shortlist approved on {formatLongDate(listing.shortlistApprovedAt)}</p>
          <p className="mt-0.5 text-sm text-muted">
            {count} applicant{count === 1 ? '' : 's'} short-listed. Tables are now read-only.
          </p>
        </div>
      </div>
      <Button to={PATHS.company.shortlist(listing.id)}>Open Short-Listed table</Button>
    </section>
  )
}
