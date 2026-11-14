// Edit an imported listing before publishing it (FR-AD4)
import { useState } from 'react'
import { Button, Input, Modal, Select } from '../../../components/ui'
import { CITIES, TRAINING_TYPES } from '../../../lib/constants'
import { validateUrl } from '../../../lib/validation'

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')
const fromDateInput = (value) => (value ? new Date(`${value}T09:00:00`).toISOString() : null)

export default function ImportEditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    title: item.title ?? '',
    companyName: item.companyName ?? '',
    city: item.city ?? '',
    trainingType: item.trainingType ?? '',
    majors: (item.majors ?? []).join(', '),
    startDate: toDateInput(item.startDate),
    deadline: toDateInput(item.deadline),
    externalUrl: item.externalUrl ?? '',
  })
  const [errors, setErrors] = useState({})
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: '' }))
  }

  const save = (e) => {
    e.preventDefault()
    const urlError = validateUrl(form.externalUrl)
    if (urlError) {
      setErrors({ externalUrl: urlError })
      return
    }
    onSave({
      title: form.title.trim(),
      companyName: form.companyName.trim(),
      city: form.city,
      trainingType: form.trainingType,
      majors: form.majors
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      startDate: fromDateInput(form.startDate),
      deadline: fromDateInput(form.deadline),
      externalUrl: form.externalUrl.trim(),
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit imported listing"
      description="Fix missing or wrong details before publishing."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="import-edit-form">
            Save changes
          </Button>
        </>
      }
    >
      <form id="import-edit-form" onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input className="sm:col-span-2" label="Title" required value={form.title} onChange={set('title')} />
        <Input label="Company" required value={form.companyName} onChange={set('companyName')} />
        <Select label="City" required value={form.city} onChange={set('city')} options={CITIES} placeholder="Select a city" />
        <Select
          label="Training type"
          required
          value={form.trainingType}
          onChange={set('trainingType')}
          options={TRAINING_TYPES}
          placeholder="Select a type"
        />
        <Input label="Majors" hint="Separate with commas" value={form.majors} onChange={set('majors')} />
        <Input label="Start date" type="date" value={form.startDate} onChange={set('startDate')} />
        <Input label="Deadline" type="date" value={form.deadline} onChange={set('deadline')} />
        <Input
          className="sm:col-span-2"
          label="Original link"
          required
          placeholder="https://"
          value={form.externalUrl}
          onChange={set('externalUrl')}
          error={errors.externalUrl}
        />
      </form>
    </Modal>
  )
}
