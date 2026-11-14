import { useId } from 'react'
import { cn } from '../../lib/cn'

/**
 * Wraps any input with a label, an optional hint and an error message.
 * The error is shown under the field in red (NFR-4: errors next to the field).
 *
 * <FormField label="Email" error={errors.email}>
 *   {(id) => <input id={id} ... />}
 * </FormField>
 */
export default function FormField({ label, hint, error, required, className, children }) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {typeof children === 'function' ? children(id) : children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}

// shared look for text inputs, selects and textareas
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
