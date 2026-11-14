/*
  Admin - External sources (screen 23, FR-AD5)
  Enable / disable the feeds that import listings, sync them, retry failed syncs and change the schedule.
*/
import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Avatar, Button, Modal, PageHeader, Select, Toggle } from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { addAuditLog } from '../../../store/actions'
import { formatDateTime } from '../../../lib/format'
import { cn } from '../../../lib/cn'
import StatChip from '../components/StatChip'
import { patchRow } from '../adminUtils'

const SCHEDULES = ['Every 6 hours', 'Every 12 hours', 'Daily']
const isOn = (source) => source.status !== 'disabled'

function ConfigureModal({ source, onClose, onSave }) {
  const [schedule, setSchedule] = useState(source.schedule ?? 'Daily')
  return (
    <Modal
      open
      onClose={onClose}
      title={`Configure ${source.name}`}
      description={source.url}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(schedule)}>Save</Button>
        </>
      }
    >
      <Select label="Sync schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} options={SCHEDULES} />
    </Modal>
  )
}

function SourceCard({ source, onToggle, onSync, onRetry, onConfigure }) {
  const on = isOn(source)
  const rows = [
    [
      'Status',
      <span key="s" className="inline-flex items-center gap-1.5">
        <span className={cn('size-2 rounded-full', on ? 'bg-primary' : 'bg-[#b8bcba]')} />
        {on ? 'Enabled' : 'Disabled'}
      </span>,
    ],
    ['Sync schedule', source.schedule],
    ['Last sync', source.lastSyncAt ? formatDateTime(source.lastSyncAt) : 'Never'],
    ['Listings found', source.lastSyncAt ? source.imported : '—'],
  ]

  return (
    <div className={cn('flex flex-col rounded-xl border bg-white p-5', source.status === 'error' ? 'border-danger/30' : 'border-line')}>
      <div className="flex items-start gap-3 border-b border-line pb-4">
        <Avatar name={source.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold">{source.name}</h3>
          <p className="truncate text-[11px] text-muted">{source.url}</p>
        </div>
        <Toggle checked={on} onChange={onToggle} label={`${on ? 'Disable' : 'Enable'} ${source.name}`} />
      </div>

      <dl className="mt-3 space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-xs">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {source.status === 'error' && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft p-3">
          <X className="mt-0.5 size-4 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-danger">Sync failed</p>
            <p className="text-[11px] text-body">{source.lastError}</p>
            {source.lastErrorAt && <p className="mt-0.5 text-[10px] text-muted">{formatDateTime(source.lastErrorAt)}</p>}
          </div>
          <button type="button" onClick={onRetry} className="text-[11px] font-semibold text-danger hover:underline">
            Retry
          </button>
        </div>
      )}

      <div className="mt-auto flex justify-between gap-3 pt-5">
        <Button variant="link" size="sm" icon={RefreshCw} disabled={!on} onClick={onSync}>
          Sync now
        </Button>
        <Button variant="link" size="sm" onClick={onConfigure}>
          Configure
        </Button>
      </div>
    </div>
  )
}

export default function ExternalSourcesPage() {
  useDocumentTitle('External sources')
  const { db, transaction } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const [configuring, setConfiguring] = useState(null)

  const sources = db.externalSources ?? []
  const log = (next, action, details) => addAuditLog(next, { action, by: user?.name ?? 'Admin', details })
  const synced = { status: 'enabled', lastSyncAt: new Date().toISOString(), lastError: null, lastErrorAt: null }

  const toggle = (source, on) => {
    transaction((cur) =>
      log(
        patchRow(cur, 'externalSources', source.id, on ? { status: 'enabled' } : { status: 'disabled' }),
        on ? 'Source enabled' : 'Source disabled',
        source.name,
      ),
    )
    toast.success(on ? `${source.name} enabled.` : `${source.name} disabled. No new listings will be imported; existing ones stay.`)
  }

  const syncOne = (source, retry = false) => {
    transaction((cur) => log(patchRow(cur, 'externalSources', source.id, synced), retry ? 'Source sync retried' : 'Source synced', source.name))
    toast.success('Sync finished. No new listings.')
  }

  const syncAll = () => {
    const active = sources.filter(isOn)
    if (active.length === 0) {
      toast.error('Enable a source first.')
      return
    }
    transaction((cur) => {
      let next = cur
      for (const s of active) next = patchRow(next, 'externalSources', s.id, synced)
      return log(next, 'All sources synced', `${active.length} sources`)
    })
    toast.success(`Synced ${active.length} source${active.length === 1 ? '' : 's'}. No new listings.`)
  }

  const saveSchedule = (schedule) => {
    const source = configuring
    transaction((cur) => log(patchRow(cur, 'externalSources', source.id, { schedule }), 'Source schedule changed', `${source.name} - ${schedule}`))
    setConfiguring(null)
    toast.success('Sync schedule saved.')
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="External sources"
        subtitle="Manage approved sources used to import training listings."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={syncAll}>
            Sync all sources
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <StatChip value={sources.filter(isOn).length} label="Enabled sources" />
        <StatChip value={sources.reduce((sum, s) => sum + (s.imported ?? 0), 0)} label="Imported total" />
        <StatChip value={sources.filter((s) => s.status === 'error').length} label="Sync issues" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            onToggle={(on) => toggle(source, on)}
            onSync={() => syncOne(source)}
            onRetry={() => syncOne(source, true)}
            onConfigure={() => setConfiguring(source)}
          />
        ))}
      </div>

      {configuring && <ConfigureModal key={configuring.id} source={configuring} onClose={() => setConfiguring(null)} onSave={saveSchedule} />}
    </>
  )
}
