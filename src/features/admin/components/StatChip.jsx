// Small "3 Pending review" chip used at the top of admin pages
export default function StatChip({ value, label }) {
  return (
    <div className="flex items-baseline gap-2 rounded-lg border border-line bg-white px-3.5 py-2.5">
      <span className="font-serif text-lg font-bold text-ink">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  )
}
