// "Add to table" - keyboard / phone friendly alternative to dragging rows onto a table
import { useState } from 'react'
import { Button, Input, Modal } from '../../../components/ui'
import { RULES } from '../../../lib/constants'
import { cn } from '../../../lib/cn'
import { TOO_MANY_TABLES, canAddTable, validateTableName } from './tableActions'

const NEW = '__new__'

export default function AddToTableModal({ open, count, tables, onClose, onAdd }) {
  const [choice, setChoice] = useState(tables[0]?.id ?? NEW)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (choice !== NEW) {
      onAdd({ tableId: choice })
      return
    }
    if (!canAddTable(tables)) {
      setError(TOO_MANY_TABLES)
      return
    }
    const problem = validateTableName(name, tables)
    if (problem) {
      setError(problem)
      return
    }
    onAdd({ newName: name.trim() })
  }

  const option = (value, label, sub) => (
    <label
      key={value}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm',
        choice === value ? 'border-primary bg-primary-soft/50' : 'border-line hover:bg-canvas',
      )}
    >
      <input
        type="radio"
        name="target-table"
        className="accent-primary"
        checked={choice === value}
        onChange={() => {
          setChoice(value)
          setError('')
        }}
      />
      <span className="flex-1 font-semibold text-ink">{label}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </label>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to table"
      description={`${count} applicant${count === 1 ? '' : 's'} selected.`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-to-table-form">
            Add
          </Button>
        </>
      }
    >
      <form id="add-to-table-form" onSubmit={submit} noValidate className="space-y-2">
        {tables.map((t) => option(t.id, t.name, `${t.applicationIds.length} applicants`))}
        {option(NEW, 'Create a new table')}
        {choice === NEW && (
          <Input
            className="pt-2"
            label="Table name"
            required
            autoFocus
            maxLength={RULES.TABLE_NAME_MAX + 10}
            placeholder="e.g. Backup picks"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            error={error}
          />
        )}
        {choice !== NEW && error && <p className="text-xs text-danger">{error}</p>}
      </form>
    </Modal>
  )
}
