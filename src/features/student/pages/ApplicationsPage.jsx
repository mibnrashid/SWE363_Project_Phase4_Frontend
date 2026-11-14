/*
  Screen 8 - My applications / tracker (FR-S5, FR-S8, FR-S9)
  Internal + external applications in one table, stats, search + status filter,
  detail drawer (timeline, withdraw, decline offer, edit / delete external),
  "Add external application" (also opened prefilled from ?addExternal=<listingId>).
*/
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight, ClipboardList, Plus, Search } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { getApplicationsForStudent, getListing, getListingCompany } from '../../../store/selectors'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { APP_STATUS, APP_STATUS_LIST } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import { Avatar, Badge, Button, EmptyState, Input, PageHeader, Select, StatCard, StatusBadge, Table, Td, Th } from '../../../components/ui'
import ApplicationDrawer from '../components/ApplicationDrawer'
import ExternalApplicationModal from '../components/ExternalApplicationModal'

// one shape for both kinds of applications so the table and the drawer can treat them the same
function buildRows(db, studentId) {
  const internal = getApplicationsForStudent(db, studentId).map((app) => {
    const listing = getListing(db, app.listingId)
    const company = getListingCompany(db, listing)
    return {
      kind: 'internal',
      id: app.id,
      title: listing?.title ?? 'Listing removed',
      companyName: company?.name ?? '',
      city: listing?.city ?? '',
      logo: company?.logo ?? null,
      status: app.status,
      appliedAt: app.appliedAt,
      app,
      listing,
    }
  })
  const external = (db.externalApplications ?? [])
    .filter((e) => e.studentId === studentId)
    .map((ext) => {
      const listing = ext.fromListingId ? getListing(db, ext.fromListingId) : null
      return {
        kind: 'external',
        id: ext.id,
        title: ext.title,
        companyName: ext.company,
        city: listing?.city ?? '',
        logo: null,
        status: ext.status,
        appliedAt: ext.appliedAt,
        ext,
        listing,
      }
    })
  return [...internal, ...external].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
}

export default function ApplicationsPage() {
  useDocumentTitle('My applications')
  const { db } = useStore()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  // modal: null (closed) or { key, initial }
  const [modal, setModal] = useState(null)

  // "Add to tracker" on an external listing sends ?addExternal=<listingId>: open the modal prefilled
  const prefillId = params.get('addExternal')
  useEffect(() => {
    if (!prefillId) return
    const listing = getListing(db, prefillId)
    setModal({
      key: `prefill-${prefillId}`,
      initial: listing ? { title: listing.title, company: listing.companyName ?? '', link: listing.externalUrl ?? '', fromListingId: listing.id } : null,
    })
    setParams({}, { replace: true })
  }, [prefillId, db, setParams])

  const rows = buildRows(db, user.id)
  const selected = rows.find((r) => r.id === selectedId) ?? null

  const q = query.trim().toLowerCase()
  const visible = rows.filter(
    (r) => (!statusFilter || r.status === statusFilter) && (!q || r.title.toLowerCase().includes(q) || r.companyName.toLowerCase().includes(q)),
  )

  const count = (...statuses) => rows.filter((r) => statuses.includes(r.status)).length

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Student workspace"
        title="My applications"
        subtitle="Track every application and stay on top of next steps."
        actions={
          <Button icon={Plus} onClick={() => setModal({ key: `new-${Date.now()}`, initial: null })}>
            Add external application
          </Button>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon={ClipboardList}
            title="No applications yet"
            message="Apply to opportunities on InternConnect or add applications you made on other sites."
            action={<Button to={PATHS.student.search}>Search listings</Button>}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard value={rows.length} label="Total applications" />
            <StatCard value={count(APP_STATUS.APPLIED, APP_STATUS.UNDER_REVIEW)} label="In progress" />
            <StatCard value={count(APP_STATUS.SHORT_LISTED)} label="Short-Listed" />
            <StatCard value={count(APP_STATUS.ACCEPTED)} label="Accepted" />
          </div>

          <div className="mt-5 rounded-xl border border-line bg-white">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <Input
                className="sm:w-72"
                icon={Search}
                aria-label="Search applications"
                placeholder="Search applications"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select
                className="sm:w-48"
                aria-label="Filter by status"
                placeholder="All statuses"
                options={APP_STATUS_LIST}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>

            {visible.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No applications match"
                message="Try another search or status."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('')
                      setStatusFilter('')
                    }}
                  >
                    Clear filters
                  </Button>
                }
                className="border-t border-line"
              />
            ) : (
              <Table className="rounded-none rounded-b-xl border-0 border-t">
                <thead>
                  <tr>
                    <Th>Opportunity</Th>
                    <Th>Date applied</Th>
                    <Th>Status</Th>
                    <Th>Source</Th>
                    <Th className="w-10">
                      <span className="sr-only">Open</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr
                      key={r.id}
                      tabIndex={0}
                      onClick={() => setSelectedId(r.id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelectedId(r.id))}
                      className="cursor-pointer hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={r.companyName} src={r.logo} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-ink">{r.title}</p>
                            <p className="truncate text-[11px] text-muted">{[r.companyName, r.city].filter(Boolean).join(' · ')}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-xs whitespace-nowrap">{formatDate(r.appliedAt)}</Td>
                      <Td>
                        <StatusBadge status={r.status} />
                      </Td>
                      <Td className="text-xs">
                        {r.kind === 'internal' ? 'InternConnect' : <Badge className="border border-line bg-white">External</Badge>}
                      </Td>
                      <Td>
                        <ChevronRight className="size-4 text-ink" />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </>
      )}

      <ApplicationDrawer row={selected} onClose={() => setSelectedId(null)} />
      {modal && <ExternalApplicationModal key={modal.key} open initial={modal.initial} onClose={() => setModal(null)} />}
    </div>
  )
}
