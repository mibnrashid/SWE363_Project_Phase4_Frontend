import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FormField, { fieldClasses } from './FormField'
import { cn } from '../../lib/cn'

/**
 * Text input with label + error.
 *
 * <Input label="Email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
 * <Input label="Password" type="password" ... />   // gets a show/hide eye button
 */
export default function Input({ label, hint, error, required, icon: Icon, type = 'text', className, inputClassName, ...rest }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <FormField label={label} hint={hint} error={error} required={required} className={className}>
      {(id) => (
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />}
          <input
            id={id}
            type={isPassword && visible ? 'text' : type}
            aria-invalid={Boolean(error)}
            className={fieldClasses(error, cn('h-11', Icon && 'pl-9', isPassword && 'pr-10', inputClassName))}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      )}
    </FormField>
  )
}
