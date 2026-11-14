/**
 * Number tile used on dashboards and statistics.
 * <StatCard icon={Briefcase} value={3} label="Active postings" note="+1 this month" />
 */
export default function StatCard({ icon: Icon, value, label, note }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
      {Icon && (
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-4" />
        </div>
      )}
      <div className="min-w-0">
        <p className="font-serif text-2xl leading-none font-bold">{value}</p>
        <p className="mt-1 text-xs text-body">{label}</p>
        {note && <p className="mt-2 text-[11px] text-primary">{note}</p>}
      </div>
    </div>
  )
}
