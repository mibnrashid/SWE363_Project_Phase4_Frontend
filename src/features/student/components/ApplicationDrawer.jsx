/*
  Detail drawer of the applications tracker (FR-S5, FR-S8, FR-S9).
  Internal: timeline, details, screening answers, Withdraw / Decline offer.
  External: timeline, details, update status + notes, delete.
*/
import { useState } from 'react'
import { ExternalLink, Trash2 } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { addNotification, setApplicationStatus } from '../../../store/actions'
import { APP_STATUS, APP_STATUS_LIST } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import { Avatar, Button, ConfirmDialog, Drawer, Select, StatusBadge, Textarea } from '../../../components/ui'
import ApplicationTimeline from './ApplicationTimeline'

const WITHDRAWABLE = [APP_STATUS.APPLIED, APP_STATUS.UNDER_REVIEW, APP_STATUS.SHORT_LISTED]

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 text-xs last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold break-all text-ink">{value}</dd>
    </div>
  )
}

function Heading({ children }) {
  return <h3 className="text-lg font-bold">{children}</h3>
}

// status + notes form for an external application (keyed by id so it resets per application)
function ExternalEditor({ ext, onSaved }) {
  const { update } = useStore()
  const toast = useToast()
  const [status, setStatus] = useState(ext.status)
  const [notes, setNotes] = useState(ext.notes ?? '')

  const save = () => {
    const now = new Date().toISOString()
    update('externalApplications', ext.id, (row) => ({
      status,
      notes: notes.trim(),
      history: status !== row.status ? [...(row.history ?? []), { status, at: now, note: 'Updated by you' }] : row.history,
    }))
    toast.success('Application updated.')
    onSaved?.()
  }

  return (
    <div className="flex flex-col gap-3">
      <Select label="Update status" options={APP_STATUS_LIST} value={status} onChange={(e) => setStatus(e.target.value)} />
      <Textarea label="Notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  )
}

/**
 * row: { kind: 'internal' | 'external', id, title, companyName, city, logo, status, appliedAt, app?, ext?, listing? }
 */
export default function ApplicationDrawer({ row, onClose }) {
  const { transaction, remove } = useStore()
  const { profile } = useAuth()
  const toast = useToast()
  const [confirm, setConfirm] = useState(null) // 'withdraw' | 'decline' | 'delete'

  if (!row) return null
  const internal = row.kind === 'internal'
  const { app, ext, listing } = row
  const history = internal ? app.history : ext.history

  const withdraw = () => {
    transaction((db) => setApplicationStatus(db, [app.id], APP_STATUS.WITHDRAWN, 'Withdrawn by student', { notify: false }))
    toast.success('Application withdrawn.')
    setConfirm(null)
  }

  const decline = () => {
    transaction((db) => {
      const next = setApplicationStatus(db, [app.id], APP_STATUS.WITHDRAWN, 'Offer declined', { notify: false })
      if (!listing?.companyId) return next
      return addNotification(next, {
        userId: listing.companyId,
        type: 'status',
        title: 'Offer declined',
        message: `${profile.name} declined the offer for ${listing.title}.`,
        link: PATHS.company.applicants(listing.id),
      })
    })
    toast.success('Offer declined. The company was notified.')
    setConfirm(null)
  }

  const deleteExternal = () => {
    remove('externalApplications', ext.id)
    toast.success('Application deleted.')
    setConfirm(null)
    onClose()
  }

  let footer = null
  if (internal && WITHDRAWABLE.includes(app.status)) {
    footer = (
      <Button variant="danger-outline" fullWidth onClick={() => setConfirm('withdraw')}>
        Withdraw application
      </Button>
    )
  } else if (internal && app.status === APP_STATUS.ACCEPTED) {
    footer = (
      <Button variant="danger-outline" fullWidth onClick={() => setConfirm('decline')}>
        Decline offer
      </Button>
    )
  } else if (!internal) {
    footer = (
      <Button variant="danger-outline" icon={Trash2} fullWidth onClick={() => setConfirm('delete')}>
        Delete from tracker
      </Button>
    )
  }

  const questions = listing?.screeningQuestions ?? []
  const answered = internal ? questions.filter((q) => app.answers?.[q.id]) : []

  return (
    <>
      <Drawer open onClose={onClose} footer={footer}>
        <Avatar name={row.companyName} size="lg" src={row.logo} />
        <h2 className="mt-4 text-[26px] leading-tight font-bold">{row.title}</h2>
        <p className="mt-1 text-xs text-muted">{[row.companyName, row.city].filter(Boolean).join(' · ')}</p>
        <StatusBadge status={row.status} className="mt-3" />

        <div className="mt-6 border-t border-line pt-6">
          <Heading>Application progress</Heading>
          <div className="mt-4">
            <ApplicationTimeline history={history} status={row.status} />
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <Heading>Application details</Heading>
          <dl className="mt-2">
            <DetailRow label="Application ID" value={row.id.toUpperCase()} />
            {internal && <DetailRow label="Resume" value={profile.resume?.fileName ?? '-'} />}
            <DetailRow label="Source" value={internal ? 'Internal' : 'External'} />
            <DetailRow label="Date applied" value={formatDate(row.appliedAt)} />
            {!internal && ext.link && (
              <DetailRow
                label="Link"
                value={
                  <a href={ext.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    Open posting <ExternalLink className="size-3" />
                  </a>
                }
              />
            )}
          </dl>
        </div>

        {answered.length > 0 && (
          <div className="mt-6 border-t border-line pt-6">
            <Heading>Screening answers</Heading>
            <dl className="mt-3 flex flex-col gap-3">
              {answered.map((q) => (
                <div key={q.id}>
                  <dt className="text-xs text-muted">{q.text}</dt>
                  <dd className="mt-0.5 text-[13px] whitespace-pre-line text-ink">{app.answers[q.id]}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {!internal && (
          <div className="mt-6 border-t border-line pt-6">
            <Heading>Update this application</Heading>
            <p className="mt-0.5 mb-3 text-xs text-muted">External applications are never updated automatically.</p>
            <ExternalEditor key={ext.id} ext={ext} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirm === 'withdraw'}
        title="Withdraw application?"
        message="You won't be able to apply to this posting again."
        confirmLabel="Withdraw"
        danger
        onConfirm={withdraw}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'decline'}
        title="Decline offer?"
        message={`${row.companyName} will be notified that you declined the offer for ${row.title}. This can't be undone.`}
        confirmLabel="Decline offer"
        danger
        onConfirm={decline}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Delete this application?"
        message="It will be removed from your tracker."
        confirmLabel="Delete"
        danger
        onConfirm={deleteExternal}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}
