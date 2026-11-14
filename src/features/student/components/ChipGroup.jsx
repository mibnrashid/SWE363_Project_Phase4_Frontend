import { Check } from 'lucide-react'
import { cn } from '../../../lib/cn'

/**
 * Multi-select chips (preferred cities, preferred training types).
 * <ChipGroup label="Preferred cities" options={CITIES} value={form.preferredCities} onChange={(list) => ...} />
 */
export default function ChipGroup({ label, hint, options, value = [], onChange }) {
  const toggle = (option) => onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])

  return (
    <fieldset>
      <legend className="text-[13px] font-semibold text-ink">{label}</legend>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
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
    </fieldset>
  )
}
