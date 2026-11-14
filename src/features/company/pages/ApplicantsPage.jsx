/*
  Applicants for one posting (screen 16, FR-C5)
  Screen 16 is split with Raed's shortlist workspace:
   - open posting, or approved shortlist -> header + applicants list + ShortlistWorkspace summary/lock
   - closed and not approved yet          -> header + only ShortlistWorkspace (it owns the applicant table)
*/
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Users } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { getApplicationsForListing, getListing, getStudent } from '../../../store/selectors'
import { APP_STATUS, APP_STATUS_LIST, POSTING_STATUS } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Select, StatusBadge, Table, Td, Th, Tabs } from '../../../components/ui'
import ShortlistWorkspace from '../shortlist/ShortlistWorkspace'

const postingTone = {
  [POSTING_STATUS.OPEN]: 'teal',
  [POSTING_STATUS.CLOSED]: 'neutral',
  [POSTING_STATUS.REMOVED]: 'danger',
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Date applied' },
  { value: 'name', label: 'Name (A-Z)' },
]

export default function ApplicantsPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { db } = useStore()
  const { user } = useAuth()
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState('date')

  const listing = getListing(db, listingId)
  const canView = Boolean(listing && listing.companyId === user.id)
  useDocumentTitle(canView ? listing.title : 'Applicants')

  if (!canView) {
    return (
      <div className="rounded-xl border border-line bg-white">
        <EmptyState
          icon={Users}
          title="Posting not found"
          message="This posting does not exist or belongs to another company."
          action={<Button to={PATHS.company.postings}>Back to My postings</Button>}
        />
      </div>
    )
  }

  const applications = getApplicationsForListing(db, listingId).map((application) => ({
    ...application,
    student: getStudent(db, application.studentId),
  }))
  const workspaceMode = listing.status === POSTING_STATUS.CLOSED && !listing.shortlistApprovedAt

  const visibleApplications = applications.filter((application) => !application.archived)
  const statuses = APP_STATUS_LIST.filter((status) => visibleApplications.some((application) => application.status === status))
  const tabs = [
    { value: 'all', label: 'All', count: visibleApplications.length },
    ...statuses.map((status) => ({
      value: status,
      label: status,
      count: visibleApplications.filter((application) => application.status === status).length,
    })),
  ]

  const rows = visibleApplications
    .filter((application) => tab === 'all' || application.status === tab)
    .sort((a, b) =>
      sort === 'name'
        ? (a.student?.name ?? '').localeCompare(b.student?.name ?? '')
        : new Date(b.appliedAt) - new Date(a.appliedAt),
    )

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Company workspace"
        title={listing.title}
        subtitle={`${applications.length} applicant${applications.length === 1 ? '' : 's'} · ${listing.openings} opening${listing.openings === 1 ? '' : 's'}`}
        actions={
          <>
            <Badge tone={postingTone[listing.status] ?? 'neutral'}>
              {listing.status === POSTING_STATUS.REMOVED ? 'Removed by admin' : listing.status === POSTING_STATUS.OPEN ? 'Open' : 'Closed'}
            </Badge>
            <Button variant="secondary" size="sm" to={PATHS.company.postings}>
              ← Back to My postings
            </Button>
          </>
        }
      />

      {!workspaceMode && (
        <Card title="Applicants" subtitle="Review everyone who applied to this posting.">
          {visibleApplications.length === 0 ? (
            <EmptyState icon={Users} title="No applicants yet." message="Applications will appear here as students apply." />
          ) : (
            <>
              <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <Tabs value={tab} onChange={setTab} options={tabs} className="min-w-0 flex-1" />
                <Select
                  className="sm:w-48"
                  aria-label="Sort applicants"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                />
              </div>

              {rows.length === 0 ? (
                <EmptyState icon={Users} title={`No ${tab} applicants`} message="Try another status filter." />
              ) : (
                <Table className="rounded-none rounded-b-xl border-0 border-t">
                  <thead>
                    <tr>
                      <Th>Name</Th>
                      <Th>University</Th>
                      <Th>Major</Th>
                      <Th>Date applied</Th>
                      <Th>Status</Th>
                      <Th className="w-10" aria-label="Open applicant" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((application) => {
                      const student = application.student
                      const clickable = application.status !== APP_STATUS.WITHDRAWN
                      return (
                        <tr
                          key={application.id}
                          tabIndex={clickable ? 0 : undefined}
                          aria-disabled={!clickable}
                          onClick={clickable ? () => navigate(PATHS.company.applicant(application.id)) : undefined}
                          onKeyDown={
                            clickable
                              ? (event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    navigate(PATHS.company.applicant(application.id))
                                  }
                                }
                              : undefined
                          }
                          className={clickable ? 'cursor-pointer hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none' : 'opacity-50'}
                        >
                          <Td>
                            <div className="flex items-center gap-3">
                              <Avatar name={student?.name ?? ''} round />
                              <span className="text-[13px] font-semibold text-ink">{student?.name ?? 'Student removed'}</span>
                            </div>
                          </Td>
                          <Td className="text-xs">{student?.university ?? '—'}</Td>
                          <Td className="text-xs">{student?.major ?? '—'}</Td>
                          <Td className="text-xs whitespace-nowrap">{formatDate(application.appliedAt)}</Td>
                          <Td>
                            <StatusBadge status={application.status} />
                          </Td>
                          <Td>{clickable && <ChevronRight className="size-4 text-ink" />}</Td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Card>
      )}

      <ShortlistWorkspace listing={listing} applications={applications} />
    </div>
  )
}
