import { SlidersHorizontal } from 'lucide-react'
import { Checkbox, Select } from '../../../components/ui'
import { CITIES, DURATIONS, MAJORS, START_WINDOWS, TRAINING_TYPES, WORK_MODES } from '../../../lib/constants'
import { hasActiveFilters } from '../../../lib/search'

/**
 * Vertical filter panel of the student search page (prototype "Find opportunities").
 * Uses the same filters object as the shared FilterBar (EMPTY_FILTERS shape from lib/search).
 *
 * <FilterSidebar filters={filters} onChange={setFilters} onClear={clearFilters} />
 */
export default function FilterSidebar({ filters, onChange, onClear }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  // two checkboxes for one value: only Paid -> 'Paid', only Unpaid -> 'Unpaid', both / none -> ''
  const paidChecked = filters.pay === 'Paid'
  const unpaidChecked = filters.pay === 'Unpaid'
  const setPay = (paid, unpaid) => onChange({ ...filters, pay: paid && !unpaid ? 'Paid' : unpaid && !paid ? 'Unpaid' : '' })

  return (
    <div className="rounded-xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" /> Filters
        </p>
        {hasActiveFilters({ ...filters, q: '' }) && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Select label="Training type" value={filters.type} onChange={set('type')} options={TRAINING_TYPES} placeholder="All types" />
        <Select label="City" value={filters.city} onChange={set('city')} options={CITIES} placeholder="All cities" />
        <Select label="Work mode" value={filters.mode} onChange={set('mode')} options={WORK_MODES} placeholder="Any mode" />
        <Select label="Duration" value={filters.duration} onChange={set('duration')} options={DURATIONS} placeholder="Any duration" />
        <Select label="Major" value={filters.major} onChange={set('major')} options={MAJORS} placeholder="All majors" />

        <fieldset>
          <legend className="text-[13px] font-semibold text-ink">Compensation</legend>
          <div className="mt-2 flex flex-col gap-2">
            <Checkbox label="Paid" checked={paidChecked} onChange={(e) => setPay(e.target.checked, unpaidChecked)} />
            <Checkbox label="Unpaid" checked={unpaidChecked} onChange={(e) => setPay(paidChecked, e.target.checked)} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[13px] font-semibold text-ink">Start date</legend>
          <div className="mt-2 flex flex-col gap-2">
            {[...START_WINDOWS, { value: '', label: 'Any time' }].map((w) => (
              <label key={w.value || 'any'} className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-body">
                <input
                  type="radio"
                  name="start-window"
                  className="size-4 cursor-pointer accent-primary"
                  checked={filters.start === w.value}
                  onChange={() => onChange({ ...filters, start: w.value })}
                />
                {w.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
