/*
  Left side of the workspace: every application of the posting with a checkbox.
  Withdrawn rows are greyed out and can't be selected.
*/
import { Link } from 'react-router-dom'
import { Avatar, Button, Select, StatusBadge, Table, Td, Th } from '../../../components/ui'
import { formatDate } from '../../../lib/format'
import { cn } from '../../../lib/cn'
import { PATHS } from '../../../routes/paths'
import { POOL_SORTS, isWithdrawn } from './tableActions'

function PoolRow({ app, checked, onToggle }) {
  const withdrawn = isWithdrawn(app)
  return (
    <tr className={cn(withdrawn && 'opacity-50')}>
      <Td className="w-10 pr-0">
        <input
          type="checkbox"
          className="size-4 cursor-pointer rounded accent-primary disabled:cursor-not-allowed"
          checked={checked}
          disabled={withdrawn}
          onChange={() => onToggle(app.id)}
          aria-label={`Select ${app.student?.name ?? 'applicant'}`}
        />
      </Td>
      <Td>
        <div className="flex items-center gap-3">
          <Avatar name={app.student?.name} round size="sm" />
          <Link to={PATHS.company.applicant(app.id)} className="text-[13px] font-semibold text-ink hover:text-primary hover:underline">
            {app.student?.name ?? 'Unknown student'}
          </Link>
        </div>
      </Td>
      <Td className="text-[13px]">{app.student?.university ?? '-'}</Td>
      <Td className="text-[13px]">{app.student?.major ?? '-'}</Td>
      <Td className="text-[13px] whitespace-nowrap">{formatDate(app.appliedAt)}</Td>
      <Td>
        <StatusBadge status={app.status} />
      </Td>
    </tr>
  )
}

export default function ApplicantPool({ apps, sort, onSortChange, selected, onToggle, onAddToTable }) {
  const count = selected.size
  return (
    <section className="flex flex-col rounded-xl border border-line bg-white">
      <header className="flex flex-wrap items-end justify-between gap-3 p-5">
        <div>
          <h2 className="text-xl font-bold">Applicants</h2>
          <p className="mt-0.5 text-xs text-muted">Select applicants to add to a table.</p>
        </div>
        <Select
          label="Sort"
          className="w-44"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          options={POOL_SORTS}
        />
      </header>

      <Table className="rounded-none border-x-0">
        <thead>
          <tr>
            <Th className="w-10 pr-0">
              <span className="sr-only">Select</span>
            </Th>
            <Th>Name</Th>
            <Th>University</Th>
            <Th>Major</Th>
            <Th>Date applied</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {apps.length === 0 && (
            <tr>
              <Td colSpan={6} className="py-10 text-center text-sm text-muted">
                No applications for this posting.
              </Td>
            </tr>
          )}
          {apps.map((app) => (
            <PoolRow key={app.id} app={app} checked={selected.has(app.id)} onToggle={onToggle} />
          ))}
        </tbody>
      </Table>

      <footer className="mt-auto flex items-center justify-end gap-4 p-4">
        <span className="text-xs text-muted">{count} selected</span>
        <Button disabled={count === 0} onClick={onAddToTable}>
          Add to table
        </Button>
      </footer>
    </section>
  )
}
