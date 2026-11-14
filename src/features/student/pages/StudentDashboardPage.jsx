/*
  Screen 6 - Student dashboard (FR-S3, FR-AI2, FR-AI5)
  States: profile incomplete banner, no resume, resume being analysed, recommendations,
  closing soon (saved listings), recent applications, empty rows.
*/
import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { companyNameOf, getApplicationsForStudent, getListing, getListingCompany, getOpenListings, isListingOpen } from '../../../store/selectors'
import { useAuth } from '../../../context/authContext'
import { useSavedListings } from '../../../hooks/useSavedListings'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { RULES } from '../../../lib/constants'
import { daysUntil, deadlineLabel, greeting } from '../../../lib/format'
import { recommendListings } from '../../../lib/match'
import { cn } from '../../../lib/cn'
import { PATHS } from '../../../routes/paths'
import { Button, Card, EmptyState, PageHeader, Spinner, StatusBadge } from '../../../components/ui'
import ListingCard from '../../../components/listings/ListingCard'
import ProfileCompletionBanner from '../components/ProfileCompletionBanner'
import ActivityRow from '../components/ActivityRow'
import { profileCompletion } from '../utils/profileCompletion'

function CardLink({ to, children }) {
  return (
    <Link to={to} className="text-[13px] font-semibold text-primary hover:underline">
      {children}
    </Link>
  )
}

export default function StudentDashboardPage() {
  useDocumentTitle('Dashboard')
  const { db } = useStore()
  const { user, profile } = useAuth()
  const { savedRows, isSaved, toggleSave } = useSavedListings()

  const firstName = (profile?.name ?? user.name ?? '').split(' ')[0]
  const completion = profileCompletion(profile)
  const resume = profile?.resume ?? null
  const analysing = resume?.status === 'pending'

  const applications = getApplicationsForStudent(db, user.id)
  const appliedIds = applications.map((a) => a.listingId)
  const openListings = getOpenListings(db)

  // recommendations (FR-S3). They use stored data, so they still show when the AI is down (FR-AI5).
  let recommended = []
  if (resume && !analysing) {
    recommended = recommendListings(profile, openListings, { excludeIds: appliedIds, limit: RULES.MAX_RECOMMENDATIONS })
  } else if (analysing) {
    // while the resume is analysed: newest open listings for the student's major, no labels
    recommended = openListings
      .filter((l) => !appliedIds.includes(l.id) && (!profile.major || (l.majors ?? []).length === 0 || l.majors.includes(profile.major)))
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
      .slice(0, RULES.MAX_RECOMMENDATIONS)
      .map((listing) => ({ listing, label: null }))
  }

  const closingSoon = savedRows
    .map((s) => getListing(db, s.listingId))
    .filter((l) => l && isListingOpen(l))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3)

  const recentApplications = [...applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 3)

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Student workspace"
        title={`${greeting()}, ${firstName}`}
        subtitle="Here's what's happening with your internship search."
      />

      {completion.percent < 100 && <ProfileCompletionBanner completion={completion} />}

      {/* Recommended for you */}
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Recommended for you</h2>
            <p className="mt-0.5 text-xs text-muted">Based on your major, skills, and preferences</p>
          </div>
          <Link to={PATHS.student.search} className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
            View all opportunities <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {!resume ? (
          <Card className="mt-4">
            <EmptyState
              icon={FileText}
              title="Upload your resume to get recommendations"
              message="We use your resume, major and skills to suggest opportunities that fit you."
              action={<Button to={PATHS.student.profile}>Upload resume</Button>}
            />
          </Card>
        ) : (
          <>
            {analysing && <Spinner label="We're analysing your resume" className="mt-4" />}
            {recommended.length === 0 ? (
              <Card className="mt-4">
                <EmptyState
                  title="No recommendations right now"
                  message="Add more skills and preferences to your profile, or browse all open opportunities."
                  action={<Button to={PATHS.student.search}>Find opportunities</Button>}
                />
              </Card>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map(({ listing, label }) => {
                  const company = getListingCompany(db, listing)
                  return (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      companyName={company?.name ?? ''}
                      companyLogo={company?.logo}
                      saved={isSaved(listing.id)}
                      onToggleSave={() => toggleSave(listing.id)}
                      matchLabel={label ?? undefined}
                      showDeadline
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Closing soon + Recent applications */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card
          title="Closing soon"
          subtitle="Saved opportunities nearing their deadline"
          action={<CardLink to={PATHS.student.saved}>View saved</CardLink>}
        >
          {closingSoon.length === 0 ? (
            <p className="py-4 text-sm text-muted">
              No saved opportunities are closing soon.{' '}
              <Link to={PATHS.student.search} className="font-semibold text-primary hover:underline">
                Find opportunities
              </Link>
            </p>
          ) : (
            <ul>
              {closingSoon.map((listing) => {
                const company = getListingCompany(db, listing)
                return (
                  <ActivityRow
                    key={listing.id}
                    to={PATHS.listing(listing.id)}
                    avatarName={company?.name ?? ''}
                    avatarSrc={company?.logo}
                    title={listing.title}
                    subtitle={`${company?.name ?? ''} · ${listing.city}`}
                    right={
                      <span className={cn('text-[11px] font-semibold', daysUntil(listing.deadline) <= 3 ? 'text-danger' : 'text-muted')}>
                        {deadlineLabel(listing.deadline)}
                      </span>
                    }
                  />
                )
              })}
            </ul>
          )}
        </Card>

        <Card
          title="Recent applications"
          subtitle="Your latest activity"
          action={<CardLink to={PATHS.student.applications}>View tracker</CardLink>}
        >
          {recentApplications.length === 0 ? (
            <p className="py-4 text-sm text-muted">
              No applications yet.{' '}
              <Link to={PATHS.student.search} className="font-semibold text-primary hover:underline">
                Search listings
              </Link>
            </p>
          ) : (
            <ul>
              {recentApplications.map((app) => {
                const listing = getListing(db, app.listingId)
                const companyName = listing ? companyNameOf(db, listing) : ''
                return (
                  <ActivityRow
                    key={app.id}
                    to={PATHS.student.applications}
                    avatarName={companyName}
                    avatarSrc={listing ? getListingCompany(db, listing)?.logo : null}
                    title={listing?.title ?? 'Listing removed'}
                    subtitle={companyName}
                    right={<StatusBadge status={app.status} />}
                  />
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

