/*
  Short-Listed applicants page (screen 17, FR-C9 export, FR-C10 finalize).
  Route: /company/postings/:listingId/shortlist
*/
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ListChecks } from 'lucide-react'
import { Avatar, Badge, Button, EmptyState, PageHeader, StatusBadge, Table, Td, Th } from '../../../components/ui'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useStore } from '../../../store/useStore'
import { addAuditLog } from '../../../store/actions'
import { getApplicationsForListing, getListing, getStudent } from '../../../store/selectors'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { APP_STATUS } from '../../../lib/constants'
import { downloadTable } from '../../../lib/exportFile'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import ExportModal from './ExportModal'
import { gpaLabel, monthYear } from './tableActions'

// applications that reached the shortlist (still Short-Listed, or Accepted / Rejected / Withdrawn after it)
function wasShortlisted(app) {
  return (
    app.status === APP_STATUS.SHORT_LISTED ||
    app.status === APP_STATUS.ACCEPTED ||
    (app.history ?? []).some((h) => h.status === APP_STATUS.SHORT_LISTED)
  )
}

function exportRow(app) {
  const s = app.student ?? {}
  return {
    name: s.name ?? '',
    university: s.university ?? '',
    major: s.major ?? '',
    gpa: s.gpa == null ? '' : gpaLabel(s),
    graduation: formatDate(s.graduationDate),
    skills: s.skills ?? [],
    email: s.email ?? '',
    resume: s.resume?.dataUrl ? 'Uploaded on InternConnect' : `${window.location.origin}/sample-resume.pdf`,
  }
}

const today = () => new Date().toISOString().slice(0, 10)

export default function ShortlistPage() {
  const { listingId } = useParams()
  const { db, transaction } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const [exportOpen, setExportOpen] = useState(false)
  useDocumentTitle('Short-Listed applicants')

  const listing = getListing(db, listingId)
  const rows = useMemo(
    () =>
      getApplicationsForListing(db, listingId)
        .filter(wasShortlisted)
        .map((app) => ({ ...app, student: getStudent(db, app.studentId) }))
        .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? '')),
    [db, listingId],
  )

  if (!listing || listing.companyId !== user?.id) {
    return (
      <EmptyState
        title="Posting not found"
        message="This posting doesn't exist or belongs to another company."
        action={<Button to={PATHS.company.postings}>Back to my postings</Button>}
      />
    )
  }

  const backLink = (
    <Link to={PATHS.company.applicants(listing.id)} className="mt-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
      <ArrowLeft className="size-3.5" /> Back to applicants
    </Link>
  )

  if (!listing.shortlistApprovedAt) {
    return (
      <>
        <PageHeader eyebrow="Company workspace" title="Short-Listed applicants" subtitle={listing.title} />
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon={ListChecks}
            title="No shortlist yet"
            message="Export and finalize are available after you approve a shortlist."
            action={<Button to={PATHS.company.applicants(listing.id)}>Go to applicants</Button>}
          />
        </div>
      </>
    )
  }

  const finalized = Boolean(listing.finalizedAt)

  const doExport = ({ format, columns }) => {
    downloadTable({
      fileName: `${listing.title} shortlist ${today()}`,
      format,
      columns,
      rows: rows.map(exportRow),
    })
    transaction((cur) =>
      addAuditLog(cur, {
        action: 'Shortlist exported',
        by: user?.name ?? 'Company',
        details: `${listing.title} - ${format === 'excel' ? 'Excel' : 'CSV'}, ${rows.length} applicants`,
      }),
    )
    setExportOpen(false)
    toast.success('Shortlist exported.')
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Company workspace</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-[40px]">Short-Listed applicants</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              {listing.title} · {rows.length} applicant{rows.length === 1 ? '' : 's'}
            </span>
            <Badge tone="teal">Shortlist approved</Badge>
            {finalized && <Badge tone="success">Finalized</Badge>}
          </div>
          {backLink}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setExportOpen(true)} disabled={rows.length === 0}>
            Export
          </Button>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Applicant</Th>
            <Th>University</Th>
            <Th>Major</Th>
            <Th>GPA</Th>
            <Th>Graduation date</Th>
            <Th>Skills</Th>
            <Th>Status</Th>
            <Th>
              <span className="sr-only">Open</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <Td colSpan={8} className="py-10 text-center text-sm text-muted">
                Nobody is on this shortlist.
              </Td>
            </tr>
          )}
          {rows.map((app) => (
            <tr key={app.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={app.student?.name} round size="sm" />
                  <span className="text-[13px] font-semibold text-ink">{app.student?.name}</span>
                </div>
              </Td>
              <Td className="text-[13px]">{app.student?.university}</Td>
              <Td className="text-[13px]">{app.student?.major}</Td>
              <Td className="text-[13px] whitespace-nowrap">{gpaLabel(app.student)}</Td>
              <Td className="text-[13px] whitespace-nowrap">{monthYear(app.student?.graduationDate)}</Td>
              <Td className="max-w-[200px] text-[12px]">{(app.student?.skills ?? []).join(', ')}</Td>
              <Td>
                <StatusBadge status={app.status} />
              </Td>
              <Td className="w-10">
                <Link to={PATHS.company.applicant(app.id)} aria-label={`Open ${app.student?.name}`} className="text-muted hover:text-ink">
                  <ChevronRight className="size-4" />
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {exportOpen && <ExportModal open onClose={() => setExportOpen(false)} onDownload={doExport} />}
    </>
  )
}
