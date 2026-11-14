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
import { ConfirmDialog } from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { POSTING_STATUS } from '../../../lib/constants'
import AddToTableModal from './AddToTableModal'
import ApplicantPool from './ApplicantPool'
import TableNameModal from './TableNameModal'
import TablesPanel from './TablesPanel'
import { ApprovedCard, LockedCard } from './WorkspaceModes'
import {
  DEFAULT_COLUMNS,
  addToTable,
  deleteTable,
  insertTable,
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
    onRemoveRow: (appId) => {
      transaction((cur) => removeFromTable(cur, table.id, [appId]))
      toast.info(`Removed ${appsById[appId]?.student?.name ?? 'applicant'} from ${table.name}.`)
    },
  })

  return (
    <>
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
        />
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
