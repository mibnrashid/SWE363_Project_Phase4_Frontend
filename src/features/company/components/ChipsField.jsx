import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { cn } from '../../../lib/cn'

/*
  Multi-select chips used by the posting form.
  - options + toggle mode: eligible majors (all options are shown, selected ones are teal)
  - allowCustom mode: required skills (type a skill and press Enter / Add)
*/
export default function ChipsField({
  label,
  hint,
  options = [],
  value = [],
  onChange,
  error,
  required,
  allowCustom = false,
  placeholder = 'Add a skill',
  maxLength = 40,
}) {
  const [input, setInput] = useState('')
  const toggle = (option) => onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])

  const addCustom = () => {
    const skill = input.trim()
    if (!skill) return
    if (!value.some((item) => item.toLowerCase() === skill.toLowerCase())) onChange([...value, skill])
    setInput('')
  }

  return (
    <fieldset>
      <legend className="text-[13px] font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </legend>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}

      {allowCustom ? (
        <>
          {value.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {value.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1 rounded-md bg-primary-soft py-1 pr-1.5 pl-2.5 text-xs font-semibold text-primary"
                >
                  {item}
                  <button
                    type="button"
                    aria-label={`Remove ${item}`}
                    onClick={() => onChange(value.filter((current) => current !== item))}
                    className="grid size-4 place-items-center rounded hover:bg-primary/10"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              aria-label={label}
              placeholder={placeholder}
              value={input}
              maxLength={maxLength}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addCustom()
                }
              }}
              className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="button"
              onClick={addCustom}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-canvas"
            >
              <Plus className="size-3.5" /> Add
            </button>
          </div>
        </>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((option) => {
            const active = value.includes(option)
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(option)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white text-body hover:border-primary/50',
                )}
              >
                {active && <Check className="size-3" />}
                {option}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
