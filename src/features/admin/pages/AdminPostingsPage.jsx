/*
  Admin - Postings (screen 21, FR-AD3)
  Every posting on the platform; the admin can remove one with a reason.
*/
import { useState } from 'react'
import { Briefcase, Search } from 'lucide-react'
import { Badge, Button, ConfirmDialog, EmptyState, Input, PageHeader, Select, Table, Td, Th } from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { addAuditLog, addNotification } from '../../../store/actions'
import { companyNameOf } from '../../../store/selectors'
import { LISTING_SOURCE, POSTING_STATUS, TRAINING_TYPES } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import { matchesText, patchRow } from '../adminUtils'

const STATUS_OPTIONS = [
  { value: POSTING_STATUS.OPEN, label: 'Open' },
  { value: POSTING_STATUS.CLOSED, label: 'Closed' },
  { value: POSTING_STATUS.REMOVED, label: 'Removed' },
]
const statusTone = { open: 'teal', closed: 'neutral', removed: 'danger' }

export default function AdminPostingsPage() {
  useDocumentTitle('Postings')
  const { db, transaction } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [removing, setRemoving] = useState(null)

  const postings = db.listings
    .map((l) => ({ ...l, company: companyNameOf(db, l) }))
    .filter((l) => (!status || l.status === status) && (!type || l.trainingType === type))
    .filter((l) => matchesText(query, l.title, l.company))
    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))

  const remove = (reason) => {
    const listing = removing
    transaction((cur) => {
      let next = patchRow(cur, 'listings', listing.id, { status: POSTING_STATUS.REMOVED, removedReason: reason })
      if (listing.companyId) {
        next = addNotification(next, {
          userId: listing.companyId,
          type: 'system',
          title: 'Removed by admin',
          message: `Your posting "${listing.title}" was removed. Reason: ${reason}`,
          link: PATHS.company.postings,
        })
      }
      return addAuditLog(next, {
        action: 'Posting removed',
        by: user?.name ?? 'Admin',
        details: `${listing.title} (${listing.company}) - ${reason}`,
      })
    })
    setRemoving(null)
    toast.success('Posting removed.')
  }

  return (
    <>
      <PageHeader eyebrow="Admin console" title="Postings" subtitle="Review and moderate all published opportunities." />

      <div className="mb-4 grid gap-3 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_180px_200px]">
        <Input
          icon={Search}
          aria-label="Search posting or company"
          placeholder="Search posting or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} placeholder="All statuses" />
        <Select
          aria-label="Training type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={TRAINING_TYPES}
          placeholder="All training types"
        />
      </div>

      {postings.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState icon={Briefcase} title="No postings found" message="Try a different search or filter." />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Posting</Th>
              <Th>Company</Th>
              <Th>Status</Th>
              <Th>City</Th>
              <Th>Deadline</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {postings.map((l) => (
              <tr key={l.id}>
                <Td className="max-w-[280px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink">{l.title}</span>
                    {l.source === LISTING_SOURCE.EXTERNAL && (
                      <Badge className="border border-line bg-white">External</Badge>
                    )}
                  </div>
                  {l.status === POSTING_STATUS.REMOVED && l.removedReason && (
                    <p className="mt-0.5 text-[11px] text-danger">Removed: {l.removedReason}</p>
                  )}
                </Td>
                <Td className="text-[13px]">{l.company}</Td>
                <Td>
                  <Badge tone={statusTone[l.status] ?? 'neutral'}>
                    {STATUS_OPTIONS.find((s) => s.value === l.status)?.label ?? l.status}
                  </Badge>
                </Td>
                <Td className="text-[13px]">{l.city}</Td>
                <Td className="text-[13px] whitespace-nowrap">{formatDate(l.deadline)}</Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" to={PATHS.listing(l.id)}>
                      View
                    </Button>
                    <Button
                      variant="danger-outline"
                      size="sm"
                      disabled={l.status === POSTING_STATUS.REMOVED}
                      onClick={() => setRemoving(l)}
                    >
                      Remove
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        open={!!removing}
        title="Remove this posting?"
        message={removing ? `"${removing.title}" will be hidden from students. The company will see your reason.` : ''}
        confirmLabel="Remove posting"
        danger
        requireReason
        reasonPlaceholder="Explain why this posting is removed."
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </>
  )
}
