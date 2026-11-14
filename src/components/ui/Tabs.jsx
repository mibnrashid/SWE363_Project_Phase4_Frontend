import { cn } from '../../lib/cn'

/**
 * Two kinds of tabs:
 *  - variant="segmented": grey pill switch (Student | Company on sign up)
 *  - variant="underline": text tabs with a teal underline (status filters)
 *
 * <Tabs value={tab} onChange={setTab} options={[{ value: 'all', label: 'All', count: 8 }, ...]} />
 * options can also be plain strings.
 */
export default function Tabs({ value, onChange, options, variant = 'underline', className }) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))

  if (variant === 'segmented') {
    return (
      <div className={cn('flex rounded-xl border border-line bg-[#efefec] p-1', className)} role="tablist">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.value === value
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              {Icon && <Icon className="size-4" />}
              {item.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}>
      <div className="flex min-w-max gap-5 border-b border-line" role="tablist">
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={cn(
                '-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm transition-colors',
                active ? 'border-primary font-semibold text-ink' : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="rounded-full bg-[#efefec] px-1.5 text-[11px] text-body">{item.count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
