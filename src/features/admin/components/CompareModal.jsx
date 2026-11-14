// Compare an imported listing with the published listing it may duplicate (FR-AD4)
import { Badge, Button, Modal } from '../../../components/ui'
import { formatLongDate, durationLabel } from '../../../lib/format'

function Side({ badge, tone, title, company, rows, text, primary, onKeep }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-white p-5">
      <Badge tone={tone} className="self-start">
        {badge}
      </Badge>
      <h3 className="mt-3 text-xl font-bold">{title}</h3>
      <p className="text-[11px] text-muted">{company}</p>
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 py-2 text-xs">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-semibold text-ink">{value || '-'}</dd>
          </div>
        ))}
      </dl>
      {text && <p className="mt-3 text-xs leading-relaxed text-body">{text}</p>}
      <Button className="mt-auto" fullWidth variant={primary ? 'primary' : 'secondary'} onClick={onKeep}>
        Keep this one
      </Button>
    </div>
  )
}

export default function CompareModal({ item, existing, companyName, onClose, onKeepImported, onKeepExisting }) {
  return (
    <Modal open onClose={onClose} size="lg">
      <p className="eyebrow">Duplicate review</p>
      <h2 className="mt-1 text-2xl font-bold">Compare similar listings</h2>
      <p className="mt-0.5 text-xs text-muted">These listings may describe the same opportunity.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 [&>div]:min-h-[340px]">
        <Side
          badge="Imported"
          tone="warning"
          title={item.title}
          company={[item.companyName, item.city].filter(Boolean).join(' · ')}
          rows={[
            ['Type', item.trainingType],
            ['Start date', item.startDate ? formatLongDate(item.startDate) : ''],
            ['Deadline', item.deadline ? formatLongDate(item.deadline) : ''],
            ['Link', item.externalUrl],
          ]}
          primary
          onKeep={onKeepImported}
        />
        {existing ? (
          <Side
            badge="Already published"
            tone="teal"
            title={existing.title}
            company={[companyName, existing.city].filter(Boolean).join(' · ')}
            rows={[
              ['Type', existing.trainingType],
              ['Duration', durationLabel(existing.durationWeeks)],
              ['Deadline', formatLongDate(existing.deadline)],
              ['Status', existing.status],
            ]}
            text={existing.summary}
            onKeep={onKeepExisting}
          />
        ) : (
          <div className="grid place-items-center rounded-xl border border-dashed border-line p-5 text-center text-sm text-muted">
            The published listing no longer exists.
          </div>
        )}
      </div>
    </Modal>
  )
}
