/*
  Admin - Imported listings (screen 22, FR-AD4)
  Listings from the external job API wait here until the admin edits, publishes or rejects them.
*/
import { useState } from 'react'
import { Briefcase, Inbox, ShieldCheck } from 'lucide-react'
import { Badge, Button, ConfirmDialog, EmptyState, PageHeader, Select, Tabs } from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { addAuditLog } from '../../../store/actions'
import { companyNameOf, getListing } from '../../../store/selectors'
import { LISTING_SOURCE, POSTING_STATUS } from '../../../lib/constants'
import { formatDateTime, timeAgo } from '../../../lib/format'
import { makeId } from '../../../lib/ids'
import ImportEditModal from '../components/ImportEditModal'
import CompareModal from '../components/CompareModal'
import { patchRow } from '../adminUtils'

const REQUIRED = ['title', 'companyName', 'city', 'trainingType', 'externalUrl']
const MISSING_MESSAGE = 'Fill in title, company, city, training type and link before publishing.'

const isMissingInfo = (item) => REQUIRED.some((key) => !String(item[key] ?? '').trim())

function reviewBadge(item) {
  if (item.status === 'published') return <Badge tone="success">Published</Badge>
  if (item.status === 'rejected') return <Badge tone="danger">Rejected</Badge>
  if (item.duplicateOf) return <Badge tone="danger">Possible duplicate</Badge>
  if (isMissingInfo(item)) return <Badge tone="warning">Missing info</Badge>
  return <Badge tone="info">Ready to review</Badge>
}

// the listing created when an import is published
function listingFromImport(item) {
  return {
    id: makeId('l'),
    source: LISTING_SOURCE.EXTERNAL,
    companyId: null,
    companyName: item.companyName,
    externalUrl: item.externalUrl,
    title: item.title,
    summary: '',
    description: 'This listing was imported from an external job board. Apply on the original website.',
    trainingType: item.trainingType,
    majors: item.majors ?? [],
    city: item.city,
    workMode: 'On-site',
    durationWeeks: 12,
    startDate: item.startDate,
    deadline: item.deadline,
    status: POSTING_STATUS.OPEN,
    removedReason: '',
    postedAt: new Date().toISOString(),
    shortlistApprovedAt: null,
    finalizedAt: null,
    skills: [],
    responsibilities: [],
    requirements: [],
    academicLevels: [],
    screeningQuestions: [],
    openings: 1,
    paid: true,
    stipend: null,
  }
}

function publishInto(db, item) {
  const listing = listingFromImport(item)
  const next = patchRow(db, 'importedListings', item.id, { status: 'published', publishedListingId: listing.id })
  return { ...next, listings: [listing, ...next.listings] }
}

export default function ImportedListingsPage() {
  useDocumentTitle('Imported listings')
  const { db, transaction } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('new')
  const [sort, setSort] = useState('newest')
  const [editing, setEditing] = useState(null)
  const [comparing, setComparing] = useState(null)
  const [rejecting, setRejecting] = useState(null)

  const imports = db.importedListings ?? []
  const count = (status) => imports.filter((i) => i.status === status).length
  const visible = imports
    .filter((i) => i.status === tab)
    .sort((a, b) => (sort === 'newest' ? 1 : -1) * (new Date(b.importedAt) - new Date(a.importedAt)))

  const log = (next, action, details) => addAuditLog(next, { action, by: user?.name ?? 'Admin', details })

  const publish = (item) => {
    if (isMissingInfo(item)) {
      toast.error(MISSING_MESSAGE)
      return false
    }
    transaction((cur) => log(publishInto(cur, item), 'Imported listing published', `${item.title} (${item.companyName})`))
    toast.success('Listing published. Students can now find it in search.')
    return true
  }

  const reject = (item) => {
    transaction((cur) => log(patchRow(cur, 'importedListings', item.id, { status: 'rejected' }), 'Imported listing rejected', item.title))
    toast.success('Imported listing rejected.')
  }

  const saveEdit = (patch) => {
    transaction((cur) => patchRow(cur, 'importedListings', editing.id, patch))
    setEditing(null)
    toast.success('Imported listing updated.')
  }

  const keepImported = () => {
    const item = comparing
    if (isMissingInfo(item)) {
      toast.error(MISSING_MESSAGE)
      return
    }
    transaction((cur) => {
      let next = publishInto(cur, item)
      if (item.duplicateOf) {
        next = patchRow(next, 'listings', item.duplicateOf, { status: POSTING_STATUS.REMOVED, removedReason: 'Duplicate listing' })
      }
      return log(next, 'Duplicate resolved', `Kept imported "${item.title}", removed the older listing`)
    })
    setComparing(null)
    toast.success('Imported listing published and the older one removed.')
  }

  const keepExisting = () => {
    const item = comparing
    transaction((cur) =>
      log(patchRow(cur, 'importedListings', item.id, { status: 'rejected' }), 'Duplicate resolved', `Kept existing listing, rejected "${item.title}"`),
    )
    setComparing(null)
    toast.success('Kept the existing listing. The import was rejected.')
  }

  const existing = comparing?.duplicateOf ? getListing(db, comparing.duplicateOf) : null

  return (
    <>
      <PageHeader eyebrow="Admin console" title="Imported listings" subtitle="Review external opportunities before publishing them." />

      <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-line bg-[#efefec] px-3 py-2 text-xs text-body">
        <ShieldCheck className="size-3.5 text-muted" />
        Listings imported from the external job listing API. Review before publishing.
      </div>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Review queue</h2>
          <p className="text-[11px] text-muted">
            {count('new')} listing{count('new') === 1 ? '' : 's'} waiting
          </p>
        </div>
        <Select
          aria-label="Sort"
          className="w-44"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
          ]}
        />
      </div>

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'new', label: 'Waiting', count: count('new') },
          { value: 'published', label: 'Published', count: count('published') },
          { value: 'rejected', label: 'Rejected', count: count('rejected') },
        ]}
      />

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {visible.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={tab === 'new' ? 'Nothing waiting for review' : `No ${tab} listings`}
            message={tab === 'new' ? 'New imports from your sources will appear here.' : undefined}
          />
        )}
        {visible.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 border-b border-line p-4 last:border-b-0 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-[#f4f4f1] text-ink">
                <Briefcase className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold text-ink">{item.title || 'Untitled listing'}</p>
                  <Badge className="border border-line bg-white">External</Badge>
                </div>
                <p className="text-xs text-muted">
                  {[item.companyName, item.city].filter(Boolean).join(' · ') || 'Company and city missing'}
                </p>
                <p className="mt-0.5 text-[11px] text-muted" title={formatDateTime(item.importedAt)}>
                  Imported {timeAgo(item.importedAt).toLowerCase()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {reviewBadge(item)}
              {item.status === 'new' && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(item)}>
                    Edit
                  </Button>
                  {item.duplicateOf && (
                    <Button variant="secondary" size="sm" onClick={() => setComparing(item)}>
                      Compare
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => publish(item)}>
                    Publish
                  </Button>
                  <Button variant="danger-outline" size="sm" onClick={() => setRejecting(item)}>
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && <ImportEditModal key={editing.id} item={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}

      {comparing && (
        <CompareModal
          item={comparing}
          existing={existing}
          companyName={existing ? companyNameOf(db, existing) : ''}
          onClose={() => setComparing(null)}
          onKeepImported={keepImported}
          onKeepExisting={keepExisting}
        />
      )}

      <ConfirmDialog
        open={!!rejecting}
        title="Reject this imported listing?"
        message={rejecting ? `"${rejecting.title}" won't be published. You can still see it in the Rejected tab.` : ''}
        confirmLabel="Reject"
        danger
        onCancel={() => setRejecting(null)}
        onConfirm={() => {
          reject(rejecting)
          setRejecting(null)
        }}
      />
    </>
  )
}
