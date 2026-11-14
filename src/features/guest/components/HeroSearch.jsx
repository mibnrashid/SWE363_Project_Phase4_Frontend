import { useState } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { CITIES } from '../../../lib/constants'

/**
 * White search box on the dark hero: keyword + city + Search button.
 * The keyword is only applied when the user presses Search / Enter, the city applies straight away.
 */
export default function HeroSearch({ q, city, onSearch }) {
  const [text, setText] = useState(q)

  const submit = (e) => {
    e.preventDefault()
    onSearch({ q: text.trim(), city })
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-[0_10px_40px_rgba(0,0,0,0.25)] sm:flex-row sm:items-center sm:gap-0"
    >
      <label className="flex flex-1 items-center gap-3 px-3">
        <Search className="size-4 shrink-0 text-muted" />
        <span className="sr-only">Job title, company, or keyword</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Job title, company, or keyword"
          className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </label>
      <div className="hidden h-10 w-px bg-line sm:block" />
      <label className="relative flex items-center gap-3 border-t border-line px-3 sm:w-56 sm:border-0">
        <MapPin className="size-4 shrink-0 text-muted" />
        <span className="sr-only">City</span>
        <select
          value={city}
          onChange={(e) => onSearch({ q: text.trim(), city: e.target.value })}
          className="h-11 w-full appearance-none bg-transparent pr-6 text-sm text-ink focus:outline-none"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted" />
      </label>
      <button
        type="submit"
        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-primary-dark"
      >
        <Search className="size-4" /> Search
      </button>
    </form>
  )
}
