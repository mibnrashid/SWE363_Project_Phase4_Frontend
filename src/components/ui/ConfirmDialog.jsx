import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Textarea from './Textarea'

/**
 * "Are you sure?" dialog. Use it for every action that can't be undone
 * (withdraw, close posting, approve shortlist, suspend user ...).
 *
 * <ConfirmDialog
 *   open={open}
 *   title="Withdraw application?"
 *   message="You won't be able to apply to this posting again."
 *   confirmLabel="Withdraw"
 *   danger
 *   onConfirm={() => { ...; setOpen(false) }}
 *   onCancel={() => setOpen(false)}
 * />
 *
 * requireReason: shows a textarea and passes the text to onConfirm(reason).
 * The confirm button stays disabled until a reason is typed.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Explain the reason...',
  onConfirm,
  onCancel,
  children,
}) {
  const [reason, setReason] = useState('')

  const close = () => {
    setReason('')
    onCancel?.()
  }

  const confirm = () => {
    onConfirm?.(reason.trim())
    setReason('')
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={confirm} disabled={requireReason && !reason.trim()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm leading-relaxed text-body">{message}</p>}
      {children}
      {requireReason && (
        <Textarea
          className="mt-4"
          label={reasonLabel}
          required
          rows={3}
          maxLength={300}
          placeholder={reasonPlaceholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      )}
    </Modal>
  )
}
