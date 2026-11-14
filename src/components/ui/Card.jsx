import { cn } from '../../lib/cn'

/**
 * White rounded box with a light border.
 * <Card className="p-6">...</Card>
 * <Card title="Recent applications" subtitle="Your latest activity" action={<Link>View</Link>}>...</Card>
 */
export default function Card({ title, subtitle, action, className, bodyClassName, children }) {
  return (
    <section className={cn('rounded-xl border border-line bg-white', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div>
            {title && <h2 className="text-xl font-bold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn(title || action ? 'p-5 sm:p-6' : '', bodyClassName)}>{children}</div>
    </section>
  )
}
