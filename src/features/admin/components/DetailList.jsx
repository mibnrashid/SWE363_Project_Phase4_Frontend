// Label / value rows used inside admin drawers
export default function DetailList({ rows }) {
  return (
    <dl className="divide-y divide-line">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-2.5 text-[13px]">
          <dt className="text-muted">{label}</dt>
          <dd className="text-right font-semibold break-all text-ink">{value || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}
