/*
  Applicant detail (screen 18, FR-C6)
  Read-only profile, screening answers, resume viewer and status history.
  Opening this page never changes the application status.
*/
import { useParams } from 'react-router-dom'
import { Download, FileText, Mail, Phone, User } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { getApplication, getListing, getStudent } from '../../../store/selectors'
import { APP_STATUS } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import { Alert, Avatar, Badge, Button, Card, EmptyState, PageHeader, StatusBadge } from '../../../components/ui'

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 text-xs last:border-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{children}</dd>
    </div>
  )
}

export default function ApplicantDetailPage() {
  const { applicationId } = useParams()
  const { db } = useStore()
  const { user } = useAuth()

  const application = getApplication(db, applicationId)
  const listing = application ? getListing(db, application.listingId) : null
  const student = application ? getStudent(db, application.studentId) : null
  const canView = Boolean(application && listing && student && listing.companyId === user.id)

  useDocumentTitle(canView ? student.name : 'Applicant')

  if (!canView) {
    return (
      <div className="rounded-xl border border-line bg-white">
        <EmptyState
          icon={User}
          title="Applicant not found"
          message="This application does not exist or belongs to another company's posting."
          action={<Button to={PATHS.company.allApplicants}>Back to applicants</Button>}
        />
      </div>
    )
  }

  const resume = student.resume
  const resumeSrc = resume?.dataUrl ?? '/sample-resume.pdf'
  const resumeName = resume?.fileName ?? 'resume.pdf'
  const answers = application.answers ?? {}

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Company workspace"
        title={
          <span className="flex flex-wrap items-center gap-3">
            {student.name}
            <StatusBadge status={application.status} />
          </span>
        }
        subtitle={`Applicant for ${listing.title}`}
        actions={
          <Button variant="secondary" to={PATHS.company.applicants(listing.id)}>
            Back to applicants
          </Button>
        }
      />

      {application.status === APP_STATUS.WITHDRAWN && (
        <Alert tone="warning" title="This applicant withdrew their application." className="mb-5">
          The application is kept for your records and can no longer move forward.
        </Alert>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="lg:sticky lg:top-24">
          <div className="text-center">
            <Avatar name={student.name} round size="lg" className="mx-auto size-20 text-lg" />
            <h2 className="mt-3 text-2xl font-bold">{student.name}</h2>
            <p className="mt-1 text-xs text-muted">
              {student.major} · {student.academicLevel || 'Level not set'}
            </p>
          </div>

          <dl className="mt-5 border-t border-line pt-2">
            <DetailRow label="University">{student.university || '—'}</DetailRow>
            <DetailRow label="Major">{student.major || '—'}</DetailRow>
            <DetailRow label="Academic level">{student.academicLevel || '—'}</DetailRow>
            <DetailRow label="Expected graduation">{student.graduationDate ? formatDate(student.graduationDate) : '—'}</DetailRow>
            <DetailRow label="GPA">
              {student.gpa !== null && student.gpa !== undefined ? `${student.gpa} / ${student.gpaScale}` : 'Not provided'}
            </DetailRow>
            <DetailRow label="Preferred cities">
              {student.preferredCities?.length ? student.preferredCities.join(', ') : '—'}
            </DetailRow>
          </dl>

          {student.skills?.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-semibold text-ink">Skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {student.skills.map((skill) => (
                  <Badge key={skill} tone="teal">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-xs">
            <a href={`mailto:${student.email}`} className="flex items-center gap-2 text-body hover:text-primary hover:underline">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{student.email}</span>
            </a>
            {student.phone && (
              <a href={`tel:${student.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-body hover:text-primary hover:underline">
                <Phone className="size-3.5 shrink-0" />
                <span>{student.phone}</span>
              </a>
            )}
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Screening answers" subtitle={`Submitted ${formatDate(application.appliedAt)}`}>
            {listing.screeningQuestions?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {listing.screeningQuestions.map((question) => (
                  <div key={question.id} className="border-t border-line pt-3 first:border-0 first:pt-0">
                    <p className="text-sm font-semibold text-ink">{question.text}</p>
                    <p className="mt-1 text-sm whitespace-pre-line text-body">{answers[question.id] || 'No answer provided.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">This posting had no screening questions.</p>
            )}
          </Card>

          <Card
            title="Resume"
            subtitle={resume ? resume.fileName : 'No resume uploaded.'}
            action={
              resume && (
                <a
                  href={resumeSrc}
                  download={resumeName}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-canvas"
                >
                  <Download className="size-4" /> Download PDF
                </a>
              )
            }
          >
            {resume ? (
              <iframe src={resumeSrc} title="Resume" className="h-[640px] w-full rounded-lg border border-line" />
            ) : (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-line px-4 py-10 text-center">
                <FileText className="size-6 text-muted" />
                <p className="mt-2 text-sm text-muted">No resume uploaded.</p>
              </div>
            )}
          </Card>

          <Card title="Status history">
            {application.history?.length ? (
              <ol className="flex flex-col gap-3">
                {application.history.map((entry, index) => (
                  <li key={`${entry.status}-${entry.at}-${index}`} className="flex flex-wrap items-start gap-3 border-t border-line pt-3 first:border-0 first:pt-0">
                    <StatusBadge status={entry.status} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-body">{entry.note || 'Status updated.'}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{formatDate(entry.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No status changes yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
