import { ChevronDown } from 'lucide-react'
import FormField, { fieldClasses } from './FormField'

/**
 * Native select with the app styling.
 * options can be strings or { value, label } objects.
 *
 * <Select label="City" value={city} onChange={(e) => setCity(e.target.value)}
 *         options={CITIES} placeholder="All cities" />
 */
export default function Select({ label, hint, error, required, options = [], placeholder, className, ...rest }) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} className={className}>
      {(id) => (
        <div className="relative">
          <select
            id={id}
            aria-invalid={Boolean(error)}
            className={fieldClasses(error, 'h-11 appearance-none pr-9')}
            {...rest}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value
              const text = typeof opt === 'string' ? opt : opt.label
              return (
                <option key={value} value={value}>
                  {text}
                </option>
              )
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
        </div>
      )}
    </FormField>
  )
}
