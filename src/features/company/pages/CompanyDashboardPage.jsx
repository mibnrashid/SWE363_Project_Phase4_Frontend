/*
  Company dashboard (screen 13, FR-C3 / FR-C4)
  Stats, recent applicants, posting performance and the latest postings table.
*/
import { Link } from 'react-router-dom'
import { Briefcase, Check, ChevronRight, Clock, Plus, User } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { getListing, getStudent } from '../../../store/selectors'
import { PATHS } from '../../../routes/paths'
import { Avatar, Button, Card, EmptyState, PageHeader, StatCard } from '../../../components/ui'
import PostingsTable from '../components/PostingsTable'
import { companyStats, postingPerformance, postingsForCompany, recentApplicants } from '../utils/postings'

function CardLink({ to, children }) {
  return (
    <Link to={to} className="text-[13px] font-semibold text-primary hover:underline">
      {children}
    </Link>
  )
}

export default function CompanyDashboardPage() {
  useDocumentTitle('Dashboard')
  const { db } = useStore()
  const { user, profile } = useAuth()

  const listings = postingsForCompany(db, user.id)
  const stats = companyStats(db, user.id)
  const applicants = recentApplicants(db, user.id)
  const performance = postingPerformance(db, user.id)
  const maxApplications = Math.max(1, ...performance.map((row) => row.count))
  const latestPostings = [...listings].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)).slice(0, 5)

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Company workspace"
        title={`Welcome back, ${profile?.name ?? user.name}`}
        subtitle="Here's an overview of your recruitment activity."
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
            message="Create your first posting to start receiving applications from students."
            action={
              <Button icon={Plus} to={PATHS.company.newPosting}>
                New posting
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Briefcase}
              value={stats.activePostings}
              label="Active postings"
              note={stats.recentlyPosted ? `+${stats.recentlyPosted} this month` : 'No new postings this month'}
            />
            <StatCard
              icon={User}
              value={stats.totalApplicants}
              label="Total applicants"
              note={stats.recentlyApplied ? `+${stats.recentlyApplied} this week` : 'No applications this week'}
            />
            <StatCard
              icon={Clock}
              value={stats.awaitingReview}
              label="Awaiting review"
              note={stats.awaitingReview ? 'Needs attention' : 'All caught up'}
            />
            <StatCard
              icon={Check}
              value={stats.shortlisted}
              label="Short-Listed"
              note={stats.shortlistedRoles ? `Across ${stats.shortlistedRoles} role${stats.shortlistedRoles === 1 ? '' : 's'}` : 'No shortlisted applicants'}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
            <Card
              title="Recent applicants"
              subtitle="New applications across your postings"
              action={<CardLink to={PATHS.company.allApplicants}>View all applicants</CardLink>}
            >
              {applicants.length === 0 ? (
                <p className="py-4 text-sm text-muted">No applications yet.</p>
              ) : (
                <ul>
                  {applicants.map((application) => {
                    const student = getStudent(db, application.studentId)
                    const listing = getListing(db, application.listingId)
                    if (!student || !listing) return null
                    return (
                      <li key={application.id} className="border-t border-line first:border-0">
                        <Link
                          to={PATHS.company.applicant(application.id)}
                          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-canvas"
                        >
                          <Avatar name={student.name} round />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink">{student.name}</p>
                            <p className="truncate text-[11px] text-muted">{listing.title}</p>
                          </div>
                          <ChevronRight className="size-4 shrink-0 text-ink" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>

            <Card
              title="Posting performance"
              subtitle="Applications received"
              action={<CardLink to={PATHS.company.postings}>Manage postings</CardLink>}
            >
              {performance.length === 0 ? (
                <p className="py-4 text-sm text-muted">No postings yet.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {performance.map(({ listing, count }) => (
                    <li key={listing.id}>
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="truncate font-medium text-body">{listing.title}</span>
                        <span className="shrink-0 text-muted">{count}</span>
                      </div>
                      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#efefec]">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round((count / maxApplications) * 100)}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card
            className="mt-5"
            title="Active postings"
            subtitle="Your currently published opportunities"
            action={<CardLink to={PATHS.company.postings}>View all postings</CardLink>}
          >
            <PostingsTable listings={latestPostings} db={db} />
          </Card>
        </>
      )}
    </div>
  )
}
