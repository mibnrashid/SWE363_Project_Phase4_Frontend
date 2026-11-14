import { SlidersHorizontal } from 'lucide-react'
import Select from '../ui/Select'
import { CITIES, COMPENSATION, DURATIONS, MAJORS, START_WINDOWS, TRAINING_TYPES, WORK_MODES } from '../../lib/constants'
import { EMPTY_FILTERS, hasActiveFilters } from '../../lib/search'

/**
 * The "Filters" card from the prototype: Major, City, Training type, Duration,
 * Start date, Compensation, Work mode + "Clear all".
 *
 * <FilterBar filters={filters} onChange={setFilters} />
 * filters uses the EMPTY_FILTERS shape from lib/search.js. Results should update
 * as soon as a filter changes (FR-S2).
 */
export default function FilterBar({ filters, onChange, className }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  return (
    <div className={`rounded-xl border border-line bg-white p-4 sm:p-5 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" /> Filters
        </p>
        {hasActiveFilters({ ...filters, q: '' }) && (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q })}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-7">
        <Select label="Major" value={filters.major} onChange={set('major')} options={MAJORS} placeholder="All majors" />
        <Select label="City" value={filters.city} onChange={set('city')} options={CITIES} placeholder="All cities" />
        <Select label="Training type" value={filters.type} onChange={set('type')} options={TRAINING_TYPES} placeholder="All types" />
        <Select label="Duration" value={filters.duration} onChange={set('duration')} options={DURATIONS} placeholder="Any duration" />
        <Select label="Start date" value={filters.start} onChange={set('start')} options={START_WINDOWS} placeholder="Any time" />
        <Select label="Compensation" value={filters.pay} onChange={set('pay')} options={COMPENSATION} placeholder="Paid & unpaid" />
        <Select label="Work mode" value={filters.mode} onChange={set('mode')} options={WORK_MODES} placeholder="Any mode" />
      </div>
    </div>
  )
}
