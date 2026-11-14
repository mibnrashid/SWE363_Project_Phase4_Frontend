import { useState } from 'react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { APP_STATUS, APP_STATUS_LIST } from '../../../lib/constants'
import { makeId } from '../../../lib/ids'
import { isValid, required, validatePastDate, validateUrl } from '../../../lib/validation'
import { Button, Input, Modal, Select, Textarea } from '../../../components/ui'

const today = () => new Date().toISOString().slice(0, 10)

/**
 * "Add external application" popup (FR-S9).
 * initial: optional { title, company, link, fromListingId } when opened from an external listing.
 * Render it with a key so the form resets every time it opens.
 */
export default function ExternalApplicationModal({ open, onClose, initial }) {
  const { insert } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    company: initial?.company ?? '',
    link: initial?.link ?? '',
    appliedAt: today(),
    status: APP_STATUS.APPLIED,
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = () => {
    const found = {
      title: required(form.title, 'Role title is required.'),
      company: required(form.company, 'Company is required.'),
      appliedAt: validatePastDate(form.appliedAt),
      link: validateUrl(form.link),
    }
    setErrors(found)
    if (!isValid(found)) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    const appliedAt = new Date(`${form.appliedAt}T12:00:00`).toISOString()
    insert('externalApplications', {
      id: makeId('ext'),
      studentId: user.id,
      company: form.company.trim(),
      title: form.title.trim(),
      link: form.link.trim(),
      appliedAt,
      status: form.status,
      notes: form.notes.trim(),
      fromListingId: initial?.fromListingId ?? null,
      history: [{ status: form.status, at: appliedAt, note: '' }],
    })
    toast.success('Application added.')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add external application"
      description="Track an application you completed on another site."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Add to tracker</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Role title" required placeholder="e.g. Business Analyst Intern" value={form.title} onChange={set('title')} error={errors.title} />
        <Input label="Company" required placeholder="Company name" value={form.company} onChange={set('company')} error={errors.company} />
        <Input label="Link" type="url" placeholder="https://" hint="Optional" value={form.link} onChange={set('link')} error={errors.link} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date applied"
            required
            type="date"
            max={today()}
            value={form.appliedAt}
            onChange={set('appliedAt')}
            error={errors.appliedAt}
          />
          <Select label="Status" options={APP_STATUS_LIST} value={form.status} onChange={set('status')} />
        </div>
        <Textarea label="Notes" rows={3} maxLength={500} placeholder="Optional" value={form.notes} onChange={set('notes')} />
      </div>
    </Modal>
  )
}
