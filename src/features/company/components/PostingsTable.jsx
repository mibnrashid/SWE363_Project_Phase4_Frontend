import { useState } from 'react'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { closePosting } from '../../../store/actions'
import { POSTING_STATUS } from '../../../lib/constants'
import { formatDate, deadlineLabel } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import { Badge, Button, ConfirmDialog, Input, Modal, Table, Td, Th } from '../../../components/ui'
import { dateInputToIso, shortlistedCount, toDateInput, validateDeadline } from '../utils/postings'
import { countActiveApplicants } from '../../../store/selectors'

const statusTone = {
  [POSTING_STATUS.OPEN]: 'teal',
  [POSTING_STATUS.CLOSED]: 'neutral',
  [POSTING_STATUS.REMOVED]: 'danger',
}

/*
  The table on "My postings" and on the company dashboard.
  It owns the close / reopen dialogs so both pages get the same behaviour.
*/
export default function PostingsTable({ listings, db }) {
  const { update, transaction } = useStore()
  const toast = useToast()
  const [closing, setClosing] = useState(null)
  const [reopening, setReopening] = useState(null)
  const [deadline, setDeadline] = useState('')
  const [deadlineError, setDeadlineError] = useState('')

  const close = () => {
    if (!closing) return
    transaction((current) => closePosting(current, closing.id, 'Closed by company'))
    toast.success('Posting closed.')
    setClosing(null)
  }

  const openReopen = (listing) => {
    setReopening(listing)
    setDeadline('')
    setDeadlineError('')
  }

  const reopen = () => {
    if (!reopening) return
    const error = validateDeadline(deadline, toDateInput(reopening.startDate), {
      requiredMessage: 'Choose a new application deadline.',
    })
    if (error) {
      setDeadlineError(error)
      return
    }
    update('listings', reopening.id, {
      status: POSTING_STATUS.OPEN,
      deadline: dateInputToIso(deadline, 23),
    })
    toast.success('Posting reopened.')
    setReopening(null)
  }

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>Posting</Th>
            <Th>Status</Th>
            <Th>Deadline</Th>
            <Th>Applicants</Th>
            <Th>Short-listed</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => {
            const open = listing.status === POSTING_STATUS.OPEN
            const closed = listing.status === POSTING_STATUS.CLOSED
            const removed = listing.status === POSTING_STATUS.REMOVED
            const shortlisted = shortlistedCount(db, listing.id)

            return (
              <tr key={listing.id} className="align-top">
                <Td>
                  <div className="min-w-[210px]">
                    <p className="font-semibold text-ink">{listing.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {listing.shortlistApprovedAt && <Badge tone="teal">Shortlist approved</Badge>}
                      {listing.finalizedAt && <Badge tone="dark">Finalized</Badge>}
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {listing.trainingType} · {listing.city}
                    </p>
                    {removed && listing.removedReason && (
                      <p className="mt-1 max-w-sm text-[11px] text-danger">Removed by admin: {listing.removedReason}</p>
                    )}
                  </div>
                </Td>
                <Td>
                  <Badge tone={statusTone[listing.status] ?? 'neutral'}>
                    {removed ? 'Removed by admin' : open ? 'Open' : 'Closed'}
                  </Badge>
                </Td>
                <Td className="text-xs whitespace-nowrap">
                  <p>{formatDate(listing.deadline)}</p>
                  {open && <p className="mt-0.5 text-[11px] text-muted">{deadlineLabel(listing.deadline)}</p>}
                </Td>
                <Td className="text-sm font-semibold">{countActiveApplicants(db, listing.id)}</Td>
                <Td className="text-sm">{shortlisted || '—'}</Td>
                <Td>
                  <div className="flex min-w-[185px] flex-wrap justify-end gap-1.5">
                    {open && (
                      <>
                        <Button variant="secondary" size="sm" to={PATHS.company.editPosting(listing.id)}>
                          Edit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setClosing(listing)}>
                          Close
                        </Button>
                        <Button size="sm" to={PATHS.company.applicants(listing.id)}>
                          Applicants
                        </Button>
                      </>
                    )}
                    {closed && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => openReopen(listing)}>
                          Reopen
                        </Button>
                        {listing.shortlistApprovedAt ? (
                          <Button size="sm" to={PATHS.company.shortlist(listing.id)}>
                            View shortlist
                          </Button>
                        ) : (
                          <Button size="sm" to={PATHS.company.applicants(listing.id)}>
                            Applicants
                          </Button>
                        )}
                      </>
                    )}
                    {removed && (
                      <Button variant="secondary" size="sm" to={PATHS.company.editPosting(listing.id)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      <ConfirmDialog
        open={Boolean(closing)}
        title="Close this posting?"
        message="It will stop accepting applications and leave search. Current applicants move to Under Review."
        confirmLabel="Close posting"
        danger
        onConfirm={close}
        onCancel={() => setClosing(null)}
      />

      <Modal
        open={Boolean(reopening)}
        onClose={() => setReopening(null)}
        title="Reopen posting"
        description="Choose a new application deadline. Applicants keep their current statuses."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReopening(null)}>
              Cancel
            </Button>
            <Button onClick={reopen}>Reopen posting</Button>
          </>
        }
      >
        <Input
          label="New application deadline"
          type="date"
          required
          min={toDateInput(new Date().toISOString())}
          value={deadline}
          onChange={(event) => {
            setDeadline(event.target.value)
            setDeadlineError('')
          }}
          error={deadlineError}
        />
      </Modal>
    </>
  )
}
