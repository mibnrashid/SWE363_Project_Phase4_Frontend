// Right side of the workspace: "Tables" card with every shortlist table of the posting
import { Plus } from 'lucide-react'
import { Button, Checkbox } from '../../../components/ui'
import ShortlistTableCard from './ShortlistTableCard'

export default function TablesPanel({
  tables,
  appsById,
  readOnly = false,
  onNewTable,
  tableHandlers,
  showReasons = false,
  onToggleReasons,
  reasonOf,
}) {
  return (
    <section className="min-w-0 self-start rounded-xl border border-line bg-white">
      <header className="flex items-start justify-between gap-3 p-4">
        <div>
          <h2 className="text-xl font-bold">Tables</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            {readOnly ? 'Tables are read-only after the shortlist is approved.' : 'Organize applicants before finalizing.'}
          </p>
        </div>
        {!readOnly && (
          <Button variant="secondary" icon={Plus} onClick={onNewTable}>
            New table
          </Button>
        )}
      </header>

      {onToggleReasons && (
        <div className="border-t border-line px-4 py-2.5">
          <Checkbox
            checked={showReasons}
            onChange={(e) => onToggleReasons(e.target.checked)}
            label={<span className="text-[11px]">Show optional Reason column</span>}
          />
        </div>
      )}

      <div className="space-y-3 border-t border-line bg-canvas/50 p-3">
        {tables.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-white px-4 py-8 text-center text-xs text-muted">
            No tables yet. Create one, or ask the assistant to make one for you.
          </p>
        )}
        {tables.map((table) => (
          <ShortlistTableCard
            key={table.id}
            table={table}
            appsById={appsById}
            readOnly={readOnly}
            reasonOf={showReasons ? reasonOf : null}
            {...(readOnly ? {} : tableHandlers(table))}
          />
        ))}
      </div>
    </section>
  )
}
