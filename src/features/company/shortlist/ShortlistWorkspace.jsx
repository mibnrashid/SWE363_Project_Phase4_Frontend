/*
  PLACEHOLDER - Raed Abumostafa replaces the body of this component on the `raed` branch.

  Rendered by Bahaa's ApplicantsPage (screen 16). Keep the name, the default export and the props.
  It has three modes:
    1. listing.status === 'open'                     -> lock card "Applicants can be shortlisted after the posting closes."
    2. closed and listing.shortlistApprovedAt is null -> the full workspace: applicants table with checkboxes,
                                                        Tables panel, Table assistant chat (Bahaa hides his list here)
    3. listing.shortlistApprovedAt is set            -> small summary "Shortlist approved" + link to the Short-Listed page

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
      <p className="mt-3 font-serif text-lg font-bold">
        {locked ? 'Applicants can be shortlisted after the posting closes' : 'Shortlist tables and assistant'}
      </p>
      <p className="mt-1 text-sm text-muted">
        {locked
          ? 'Applications are still arriving. Tables and assistant chat will unlock when you close the posting.'
          : `Being built by Raed Abumostafa (FR-C7, FR-C8, FR-AI3, FR-AI4, FR-AI5). ${applications.length} applications received.`}
      </p>
    </section>
  )
}
