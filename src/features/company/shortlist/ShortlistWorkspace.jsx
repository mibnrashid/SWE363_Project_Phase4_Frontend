/*
  Shortlist workspace (screen 16, FR-C7, FR-C8, FR-AI3, FR-AI4, FR-AI5).
  Rendered by ApplicantsPage with two props:
    listing       the posting
    applications  every application of the posting, each { ...application, student }

  Three modes:
    1. posting open                -> lock card
    2. closed, shortlist not done  -> applicants pool + tables + assistant
    3. shortlist approved          -> summary card + read-only tables
*/
import { useMemo, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { ConfirmDialog } from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { useAiStatus } from '../../../hooks/useAiStatus'
import { useAuth } from '../../../context/authContext'
import { addAuditLog, setApplicationStatus } from '../../../store/actions'
import { APP_STATUS, POSTING_STATUS } from '../../../lib/constants'
import { AI_LABEL, REASON_UNAVAILABLE, reasonFor } from './reasons'
import AddToTableModal from './AddToTableModal'
import ApplicantPool from './ApplicantPool'
import AssistantChat from './AssistantChat'
import TableNameModal from './TableNameModal'
import TablesPanel from './TablesPanel'
import { ApprovedCard, LockedCard } from './WorkspaceModes'
import {
  DEFAULT_COLUMNS,
  addToTable,
  deleteTable,
  insertTable,
  isUnderReview,
  isWithdrawn,
  makeTable,
  patchTable,
  removeFromTable,
  sortApplications,
  sortTable,
  tablesForListing,
} from './tableActions'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function ShortlistWorkspace({ listing, applications }) {
  const { db, transaction } = useStore()
  const toast = useToast()
  const [sort, setSort] = useState('appliedAt')
  const [selected, setSelected] = useState(() => new Set())
  const [nameModal, setNameModal] = useState(null) // { table } when renaming, { table: null } when creating
  const [addOpen, setAddOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [dragLabel, setDragLabel] = useState('')
  const [approving, setApproving] = useState(null)
  const { user } = useAuth()
  const [showReasons, setShowReasons] = useState(false)
  const { aiAvailable } = useAiStatus()
  // FR-AI4 / FR-AI5: reasons are always labelled, and unavailable when the AI service is down
  const reasonOf = (app) =>
    aiAvailable ? `${AI_LABEL} · ${reasonFor(app.student, listing)}` : REASON_UNAVAILABLE
  // distance: clicks on checkboxes and links still work; delay: phones can still scroll
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  )

  const tables = tablesForListing(db, listing.id)
  const appsById = useMemo(() => Object.fromEntries(applications.map((a) => [a.id, a])), [applications])
  const poolApps = useMemo(
    () => sortApplications(applications, sort, { newestFirst: true }),
    [applications, sort],
  )

  if (listing.status === POSTING_STATUS.OPEN) return <LockedCard />

  if (listing.shortlistApprovedAt) {
    return (
      <>
        <ApprovedCard listing={listing} applications={applications} />
        {tables.length > 0 && (
          <div className="mt-6 max-w-xl">
            <TablesPanel tables={tables} appsById={appsById} readOnly />
          </div>
        )}
      </>
    )
  }

  // only applicants that can still be placed in a table
  const usableIds = (ids) => ids.filter((id) => appsById[id] && !isWithdrawn(appsById[id]))

  const toggle = (id) => {
    if (!usableIds([id]).length) return
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const createTable = (name) => {
    transaction((cur) => insertTable(cur, makeTable(listing.id, name)))
    toast.success(`Table "${name}" created.`)
    setNameModal(null)
  }

  const renameTable = (table, name) => {
    transaction((cur) => patchTable(cur, table.id, { name }))
    toast.success('Table renamed.')
    setNameModal(null)
  }

  const addSelected = ({ tableId, newName }) => {
    const ids = usableIds([...selected])
    if (newName) {
      transaction((cur) => insertTable(cur, makeTable(listing.id, newName, 'company', ids)))
      toast.success(`Added ${plural(ids.length, 'applicant')} to ${newName}.`)
    } else {
      const table = tables.find((t) => t.id === tableId)
      transaction((cur) => addToTable(cur, tableId, ids))
      toast.success(`Added ${plural(ids.length, 'applicant')} to ${table?.name ?? 'the table'}.`)
    }
    setSelected(new Set())
    setAddOpen(false)
  }

  // which application ids a drag carries: ticked rows travel together (multi-select drag)
  const draggedIds = (activeId) => {
    const [kind, ...rest] = String(activeId).split(':')
    if (kind === 'pool') {
      const appId = rest[0]
      return selected.has(appId) ? usableIds([...selected]) : usableIds([appId])
    }
    if (kind === 'table') return [rest[1]]
    return []
  }

  const handleDragEnd = ({ active, over }) => {
    setDragLabel('')
    if (!over || !String(over.id).startsWith('drop:')) return
    const targetId = String(over.id).slice(5)
    const target = tables.find((t) => t.id === targetId)
    const ids = draggedIds(active.id)
    if (!target || ids.length === 0) return

    const [kind, sourceId] = String(active.id).split(':')
    if (kind === 'table') {
      if (sourceId === targetId) return
      const source = tables.find((t) => t.id === sourceId)
      transaction((cur) => addToTable(removeFromTable(cur, sourceId, ids), targetId, ids))
      toast.success(`Moved ${appsById[ids[0]]?.student?.name ?? 'applicant'} from ${source?.name} to ${target.name}.`)
      return
    }
    const fresh = ids.filter((id) => !target.applicationIds.includes(id))
    if (fresh.length === 0) {
      toast.info(`Already in ${target.name}.`)
      return
    }
    transaction((cur) => addToTable(cur, targetId, fresh))
    toast.success(`Added ${plural(fresh.length, 'applicant')} to ${target.name}.`)
    if (selected.has(String(active.id).slice(5))) setSelected(new Set())
  }

  const handleDragStart = ({ active }) => {
    const ids = draggedIds(active.id)
    setDragLabel(ids.length > 1 ? `${ids.length} applicants` : (appsById[ids[0]]?.student?.name ?? 'Applicant'))
  }

  // FR-C8: N = table members Under Review, M = every other Under Review applicant (Withdrawn skipped)
  const shortlistSplit = (table) => {
    const members = new Set(table.applicationIds)
    const underReview = applications.filter(isUnderReview)
    return {
      shortlisted: underReview.filter((a) => members.has(a.id)).map((a) => a.id),
      others: underReview.filter((a) => !members.has(a.id)).map((a) => a.id),
    }
  }

  const approveShortlist = () => {
    const table = approving
    const { shortlisted, others } = shortlistSplit(table)
    if (shortlisted.length === 0) {
      toast.error('This table has no Under Review applicants.')
      setApproving(null)
      return
    }
    const now = new Date().toISOString()
    transaction((cur) => {
      const current = cur.listings.find((l) => l.id === listing.id)
      if (current?.shortlistApprovedAt) return cur // allowed once per posting
      let next = setApplicationStatus(cur, shortlisted, APP_STATUS.SHORT_LISTED, 'Added to the shortlist')
      next = setApplicationStatus(next, others, APP_STATUS.REJECTED, 'Not short-listed')
      next = {
        ...next,
        listings: next.listings.map((l) => (l.id === listing.id ? { ...l, shortlistApprovedAt: now } : l)),
        shortlistTables: next.shortlistTables.map((t) => (t.id === table.id ? { ...t, isShortlist: true } : t)),
      }
      return addAuditLog(next, {
        action: 'Shortlist approved',
        by: user?.name ?? 'Company',
        details: `${listing.title} - ${shortlisted.length} short-listed`,
      })
    })
    setApproving(null)
    toast.success('Shortlist approved.')
  }

  const tableHandlers = (table) => ({
    onRename: () => setNameModal({ table }),
    onDelete: () => setDeleting(table),
    onSort: (field) => {
      transaction((cur) => sortTable(cur, table.id, field, appsById))
      toast.success(`${table.name} sorted.`)
    },
    onToggleColumn: (key) => {
      const current = table.columns ?? DEFAULT_COLUMNS
      const columns = current.includes(key) ? current.filter((c) => c !== key) : [...current, key]
      transaction((cur) => patchTable(cur, table.id, { columns }))
    },
    onUseAsShortlist: () => setApproving(table),
    onRemoveRow: (appId) => {
      transaction((cur) => removeFromTable(cur, table.id, [appId]))
      toast.info(`Removed ${appsById[appId]?.student?.name ?? 'applicant'} from ${table.name}.`)
    },
  })

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDragLabel('')}
      >
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <ApplicantPool
            apps={poolApps}
            sort={sort}
            onSortChange={setSort}
            selected={selected}
            onToggle={toggle}
            onAddToTable={() => setAddOpen(true)}
          />
          <TablesPanel
            tables={tables}
            appsById={appsById}
            onNewTable={() => setNameModal({ table: null })}
            tableHandlers={tableHandlers}
            showReasons={showReasons}
            onToggleReasons={setShowReasons}
            reasonOf={reasonOf}
          />
        </div>
        <DragOverlay dropAnimation={null}>
          {dragLabel && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-night px-3 py-2 text-xs font-semibold text-white shadow-xl">
              <GripVertical className="size-3.5" />
              {dragLabel}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="mt-6">
        <AssistantChat listing={listing} applications={applications} tables={tables} />
      </div>

      {nameModal && (
        <TableNameModal
          open
          table={nameModal.table}
          tables={tables}
          onClose={() => setNameModal(null)}
          onSave={(name) => (nameModal.table ? renameTable(nameModal.table, name) : createTable(name))}
        />
      )}

      {addOpen && (
        <AddToTableModal
          open
          count={selected.size}
          tables={tables}
          onClose={() => setAddOpen(false)}
          onAdd={addSelected}
        />
      )}

      <ConfirmDialog
        open={!!approving}
        title="Use this table as the shortlist?"
        message={
          approving
            ? (() => {
                const { shortlisted, others } = shortlistSplit(approving)
                return `${plural(shortlisted.length, 'applicant')} will become Short-Listed. ${plural(others.length, 'applicant')} will be Rejected. This can't be undone.`
              })()
            : ''
        }
        confirmLabel="Confirm"
        onCancel={() => setApproving(null)}
        onConfirm={approveShortlist}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this table?"
        message={deleting ? `"${deleting.name}" will be deleted. The applicants stay in the applicants list.` : ''}
        confirmLabel="Delete table"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          transaction((cur) => deleteTable(cur, deleting.id))
          toast.success('Table deleted.')
          setDeleting(null)
        }}
      />
    </>
  )
}
