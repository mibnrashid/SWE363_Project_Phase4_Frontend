import { cn } from '../../lib/cn'

// shared look for text inputs, selects and textareas (red when there is an error)
export function fieldClasses(error, extra) {
  return cn(
    'w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-muted/70',
    'transition-colors focus:outline-none focus:ring-2',
    error
      ? 'border-danger/50 bg-danger-soft/60 focus:ring-danger/20'
      : 'border-line focus:border-primary focus:ring-primary/15',
    'disabled:bg-canvas disabled:text-muted',
    extra,
  )
}
