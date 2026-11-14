// FR-C9: export the short-listed applicants as CSV or Excel with a choice of columns
import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button, Checkbox, Modal } from '../../../components/ui'
import { cn } from '../../../lib/cn'

const EXPORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'university', label: 'University' },
  { key: 'major', label: 'Major' },
  { key: 'gpa', label: 'GPA' },
  { key: 'graduation', label: 'Graduation date' },
  { key: 'skills', label: 'Skills' },
  { key: 'email', label: 'Email' },
  { key: 'resume', label: 'Resume link' },
]

const FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
]

export default function ExportModal({ open, onClose, onDownload }) {
  const [format, setFormat] = useState('csv')
  const [keys, setKeys] = useState(() => EXPORT_COLUMNS.map((c) => c.key))
  const [error, setError] = useState('')

  const toggle = (key) => {
    setError('')
    setKeys((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]))
  }

  const download = () => {
    if (keys.length === 0) {
      setError('Select at least one column.')
      return
    }
    onDownload({ format, columns: EXPORT_COLUMNS.filter((c) => keys.includes(c.key)) })
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <Upload className="size-5" />
        </div>
        <h2 className="mt-3 text-2xl font-bold">Export short-listed applicants</h2>
        <p className="mt-1 text-sm text-muted">Choose a format and the columns to include.</p>
      </div>

      <fieldset className="mt-5">
        <legend className="text-[13px] font-semibold text-ink">File format</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {FORMATS.map((f) => (
            <label
              key={f.value}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm',
                format === f.value ? 'border-primary bg-primary-soft/50 font-semibold text-ink' : 'border-line text-body',
              )}
            >
              <input
                type="radio"
                name="export-format"
                className="accent-primary"
                checked={format === f.value}
                onChange={() => setFormat(f.value)}
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={cn('mt-4 rounded-lg border px-4 pt-2 pb-3', error ? 'border-danger/50' : 'border-line')}>
        <legend className="px-1 text-[13px] font-semibold text-ink">Columns</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {EXPORT_COLUMNS.map((c) => (
            <Checkbox key={c.key} label={c.label} checked={keys.includes(c.key)} onChange={() => toggle(c.key)} />
          ))}
        </div>
      </fieldset>
      {error && (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <Button fullWidth size="lg" className="mt-5" onClick={download}>
        Download
      </Button>
    </Modal>
  )
}
