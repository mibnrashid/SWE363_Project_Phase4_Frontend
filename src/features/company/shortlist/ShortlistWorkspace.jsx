/*
  PLACEHOLDER - Raed Abumostafa replaces the body of this component on the `raed` branch.

  This component is rendered INSIDE Bahaa's ApplicantsPage (screen 16), under the applicants list.
  Bahaa owns ApplicantsPage.jsx, Raed owns everything in src/features/company/shortlist/.
  Keep the name, the default export and the props below exactly the same so the two branches fit together.

  Props (passed by ApplicantsPage):
    listing       the posting object from db.listings
    applications  every application for this posting (all statuses, including Withdrawn),
                  each one already joined with its student:  { ...application, student }
*/
import { Lock } from 'lucide-react'
import { POSTING_STATUS } from '../../../lib/constants'

export default function ShortlistWorkspace({ listing, applications }) {
  const locked = listing.status === POSTING_STATUS.OPEN
  return (
    <section className="mt-8 rounded-xl border border-dashed border-line bg-white p-6 text-center">
      <div className="mx-auto grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
        <Lock className="size-4" />
      </div>
      <p className="mt-3 font-serif text-lg font-bold">Shortlist tables and assistant</p>
      <p className="mt-1 text-sm text-muted">
        {locked
          ? 'Applicants can be shortlisted after the posting closes.'
          : `Being built by Raed Abumostafa (FR-C7, FR-C8, FR-AI3, FR-AI4, FR-AI5). ${applications.length} applications received.`}
      </p>
    </section>
  )
}
