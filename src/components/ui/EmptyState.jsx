import { Inbox } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * Shown when a list is empty ("No applications yet", "You're all caught up").
 *
 * <EmptyState icon={Bookmark} title="You haven't saved any listings yet"
 *   message="Save listings to come back to them later."
 *   action={<Button to="/student/search">Search listings</Button>} />
 */
export default function EmptyState({ icon: Icon = Inbox, title, message, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
