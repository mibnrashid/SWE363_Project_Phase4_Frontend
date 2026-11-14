/*
  PLACEHOLDER - Bahaa Najjar replaces this page on the `bahaa` branch (screen 16, FR-C5).

  How screen 16 is split between Bahaa and Raed (keep this logic):
   - posting OPEN, or shortlist already approved  -> Bahaa's applicants list, then <ShortlistWorkspace /> below it
                                                     (Raed shows a lock card / "shortlist approved" summary there)
   - posting CLOSED and no shortlist approved yet -> ONLY <ShortlistWorkspace />. It contains its own applicants
                                                     table with checkboxes, the tables panel and the chat (prototype).
  ShortlistWorkspace belongs to Raed (src/features/company/shortlist/). Pass it exactly these two props.
*/
import { useParams } from 'react-router-dom'
import ComingSoon from '../../../components/ComingSoon'
import ShortlistWorkspace from '../shortlist/ShortlistWorkspace'
import { useStore } from '../../../store/useStore'
import { getApplicationsForListing, getListing, getStudent } from '../../../store/selectors'
import { POSTING_STATUS } from '../../../lib/constants'

export default function ApplicantsPage() {
  const { listingId } = useParams()
  const { db } = useStore()
  const listing = getListing(db, listingId)
  const applications = getApplicationsForListing(db, listingId).map((app) => ({ ...app, student: getStudent(db, app.studentId) }))
  const workspaceMode = listing?.status === POSTING_STATUS.CLOSED && !listing?.shortlistApprovedAt

  return (
    <>
      {!workspaceMode && <ComingSoon eyebrow="Company workspace" title="Applicants" owner="Bahaa Najjar" requirements="FR-C5" />}
      {listing && <ShortlistWorkspace listing={listing} applications={applications} />}
    </>
  )
}
