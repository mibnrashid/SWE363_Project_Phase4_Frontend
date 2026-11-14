// Modal for "+ New table" and "Rename" (FR-C7 name rules: required, max 40 characters, unique per posting)
import { useState } from 'react'
import { Button, Input, Modal } from '../../../components/ui'
import { RULES } from '../../../lib/constants'
import { TOO_MANY_TABLES, canAddTable, validateTableName } from './tableActions'

export default function TableNameModal({ open, table, tables, onClose, onSave }) {
  // `table` is set when renaming, null when creating
  const [name, setName] = useState(table?.name ?? '')
  const [error, setError] = useState('')

  const save = (e) => {
    e.preventDefault()
    if (!table && !canAddTable(tables)) {
      setError(TOO_MANY_TABLES)
      return
    }
    const problem = validateTableName(name, tables, table?.id)
    if (problem) {
      setError(problem)
      return
    }
    onSave(name.trim())
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={table ? 'Rename table' : 'New table'}
      description={table ? undefined : 'Group applicants before you choose the shortlist.'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="table-name-form">
            {table ? 'Save' : 'Create table'}
          </Button>
        </>
      }
    >
      <form id="table-name-form" onSubmit={save} noValidate>
        <Input
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
          hint={`${name.trim().length}/${RULES.TABLE_NAME_MAX}`}
        />
      </form>
    </Modal>
  )
}
