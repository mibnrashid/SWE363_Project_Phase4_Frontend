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
import { POSTING_STATUS } from '../../../lib/constants'
import ApplicantPool from './ApplicantPool'
import { ApprovedCard, LockedCard } from './WorkspaceModes'
import { isWithdrawn, sortApplications } from './tableActions'

export default function ShortlistWorkspace({ listing, applications }) {
  const [sort, setSort] = useState('appliedAt')
  const [selected, setSelected] = useState(() => new Set())

  const poolApps = useMemo(
    () => sortApplications(applications, sort, { newestFirst: true }),
    [applications, sort],
  )

  if (listing.status === POSTING_STATUS.OPEN) return <LockedCard />
  if (listing.shortlistApprovedAt) return <ApprovedCard listing={listing} applications={applications} />

  const toggle = (id) => {
    const app = applications.find((a) => a.id === id)
    if (!app || isWithdrawn(app)) return
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <ApplicantPool
        apps={poolApps}
        sort={sort}
        onSortChange={setSort}
        selected={selected}
        onToggle={toggle}
        onAddToTable={() => {}}
      />
    </div>
  )
}
