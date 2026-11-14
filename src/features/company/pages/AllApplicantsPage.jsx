/*
  Applicants across all postings (FR-C5)
  One card per posting with status counts and a shortcut to the applicants list.
  Also lets the company search every applicant by name.
*/
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, ChevronRight, Plus, Search } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { getStudent } from '../../../store/selectors'
import { APP_STATUS_LIST, POSTING_STATUS } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import { Avatar, Badge, Button, Card, EmptyState, Input, PageHeader, StatusBadge } from '../../../components/ui'
import { companyApplications, countByStatus, postingsForCompany } from '../utils/postings'

const statusOrder = {
  [POSTING_STATUS.OPEN]: 0,
  [POSTING_STATUS.CLOSED]: 1,
  [POSTING_STATUS.REMOVED]: 2,
}

const postingTone = {
  [POSTING_STATUS.OPEN]: 'teal',
  [POSTING_STATUS.CLOSED]: 'neutral',
  [POSTING_STATUS.REMOVED]: 'danger',
}

export default function AllApplicantsPage() {
  useDocumentTitle('Applicants')
  const { db } = useStore()
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const listings = [...postingsForCompany(db, user.id)].sort(
    (a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3) || new Date(b.postedAt) - new Date(a.postedAt),
  )

  const q = query.trim().toLowerCase()
  const matches = q
    ? companyApplications(db, user.id)
        .filter((application) => !application.archived)
        .map((application) => ({
          application,
          student: getStudent(db, application.studentId),
          listing: db.listings.find((listing) => listing.id === application.listingId),
        }))
        .filter(({ student }) => student?.name.toLowerCase().includes(q))
    : []

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Company workspace"
        title="Applicants"
        subtitle="Applications across all your postings."
        actions={
          <Button icon={Plus} to={PATHS.company.newPosting}>
            New posting
          </Button>
        }
      />

      {listings.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon={Briefcase}
            title="You haven't posted any opportunities yet"
            message="Create a posting to start receiving applications."
            action={
              <Button icon={Plus} to={PATHS.company.newPosting}>
                New posting
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-xl border border-line bg-white p-3 sm:p-4">
            <Input
              className="sm:max-w-sm"
              icon={Search}
              aria-label="Search applicants by name"
              placeholder="Search applicants by name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {q && (
            <Card className="mb-5" title="Matching applicants" subtitle={`Names containing “${query.trim()}”`}>
              {matches.length === 0 ? (
                <p className="py-3 text-sm text-muted">No applicants match this name.</p>
              ) : (
                <ul>
                  {matches.slice(0, 20).map(({ application, student, listing }) => (
                    <li key={application.id} className="border-t border-line first:border-0">
                      <Link
                        to={PATHS.company.applicant(application.id)}
                        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-canvas"
                      >
                        <Avatar name={student.name} round />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{student.name}</p>
                          <p className="truncate text-[11px] text-muted">{listing?.title ?? 'Posting removed'}</p>
                        </div>
                        <StatusBadge status={application.status} />
                        <ChevronRight className="size-4 shrink-0 text-ink" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <div className="flex flex-col gap-4">
            {listings.map((listing) => {
              const applications = db.applications.filter(
                (application) => application.listingId === listing.id && !application.archived,
              )
              const counts = countByStatus(applications)

              return (
                <Card
                  key={listing.id}
                  title={listing.title}
                  subtitle={`${listing.trainingType} · ${listing.city} · Deadline ${formatDate(listing.deadline)}`}
                  action={
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={postingTone[listing.status] ?? 'neutral'}>
                        {listing.status === POSTING_STATUS.REMOVED ? 'Removed by admin' : listing.status === POSTING_STATUS.OPEN ? 'Open' : 'Closed'}
                      </Badge>
                      <Button size="sm" to={PATHS.company.applicants(listing.id)}>
                        View applicants
                      </Button>
                    </div>
                  }
                >
                  {applications.length === 0 ? (
                    <p className="py-2 text-sm text-muted">No applications yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {APP_STATUS_LIST.map((status) => (
                        <span
                          key={status}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2 py-1"
                          title={`${counts[status]} ${status}`}
                        >
                          <StatusBadge status={status} />
                          <span className="text-[11px] font-semibold text-body">{counts[status]}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
