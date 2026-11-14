import FormField, { fieldClasses } from './FormField'

/**
 * Multi-line text input. Pass maxLength to show a character counter.
 *
 * <Textarea label="Short bio" rows={4} maxLength={300} value={bio} onChange={...} />
 */
export default function Textarea({ label, hint, error, required, className, rows = 4, maxLength, value = '', ...rest }) {
  const counter = maxLength ? `${String(value).length}/${maxLength}` : null
  return (
    <FormField label={label} hint={hint ?? counter} error={error} required={required} className={className}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          maxLength={maxLength}
          value={value}
          aria-invalid={Boolean(error)}
          className={fieldClasses(error, 'resize-y py-2.5 leading-relaxed')}
          {...rest}
        />
      )}
    </FormField>
  )
}
