// One shortlist table on the right side of the workspace
import { GripVertical, X } from 'lucide-react'
import { cn } from '../../../lib/cn'
import TableMenu from './TableMenu'
import { gpaLabel, monthYear } from './tableActions'

function rowDetails(student, columns) {
  if (!student) return ''
  const parts = []
  if (columns.includes('major')) parts.push(student.major)
  if (columns.includes('gpa')) parts.push(`GPA ${gpaLabel(student)}`)
  if (columns.includes('graduation')) parts.push(`Graduates ${monthYear(student.graduationDate)}`)
  if (columns.includes('skills') && student.skills?.length) parts.push(student.skills.join(', '))
  return parts.join(' · ')
}

export function TableRow({ app, index, columns, readOnly, onRemove }) {
  const details = rowDetails(app.student, columns)
  return (
    <li className="flex items-start gap-2 border-t border-line py-2.5">
      {!readOnly && <GripVertical className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />}
      <span className="w-4 shrink-0 pt-px text-[11px] text-muted">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{app.student?.name ?? 'Unknown student'}</p>
        {details && <p className="mt-0.5 text-[11px] text-muted">{details}</p>}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${app.student?.name ?? 'applicant'} from table`}
          className="grid size-6 shrink-0 place-items-center rounded text-muted hover:bg-danger-soft hover:text-danger"
        >
          <X className="size-3.5" />
        </button>
      )}
    </li>
  )
}

export default function ShortlistTableCard({ table, appsById, readOnly, onRename, onSort, onToggleColumn, onDelete, onRemoveRow }) {
  const rows = table.applicationIds.map((id) => appsById[id]).filter(Boolean)
  const columns = table.columns ?? ['major']

  return (
    <div className={cn('rounded-xl border border-line bg-white p-4', table.isShortlist && 'border-primary/40')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{table.name}</h3>
          <p className="text-[11px] text-muted">
            {rows.length} applicant{rows.length === 1 ? '' : 's'}
            {table.isShortlist && ' · Used as shortlist'}
          </p>
        </div>
        {!readOnly && (
          <TableMenu table={table} onRename={onRename} onSort={onSort} onToggleColumn={onToggleColumn} onDelete={onDelete} />
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-line px-3 py-5 text-center text-xs text-muted">
          {readOnly ? 'No applicants in this table.' : 'Drag applicants here or use Add to table.'}
        </p>
      ) : (
        <ol className="mt-3">
          {rows.map((app, i) => (
            <TableRow
              key={app.id}
              app={app}
              index={i}
              columns={columns}
              readOnly={readOnly}
              onRemove={() => onRemoveRow(app.id)}
            />
          ))}
        </ol>
      )}
    </div>
  )
}
