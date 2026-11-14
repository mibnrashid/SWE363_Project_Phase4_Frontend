/*
  PLACEHOLDER - Bahaa Najjar replaces this page on the `bahaa` branch (screen 16, FR-C5).

  IMPORTANT: keep rendering <ShortlistWorkspace listing={listing} applications={applications} />
  below your applicants list. That component belongs to Raed (src/features/company/shortlist/).
*/
import { useParams } from 'react-router-dom'
import ComingSoon from '../../../components/ComingSoon'
import ShortlistWorkspace from '../shortlist/ShortlistWorkspace'
import { useStore } from '../../../store/useStore'
import { getApplicationsForListing, getListing, getStudent } from '../../../store/selectors'

export default function ApplicantsPage() {
  const { listingId } = useParams()
  const { db } = useStore()
  const listing = getListing(db, listingId)
  const applications = getApplicationsForListing(db, listingId).map((app) => ({ ...app, student: getStudent(db, app.studentId) }))

  return (
    <>
      <ComingSoon eyebrow="Company workspace" title="Applicants" owner="Bahaa Najjar" requirements="FR-C5" />
      {listing && <ShortlistWorkspace listing={listing} applications={applications} />}
    </>
  )
}
