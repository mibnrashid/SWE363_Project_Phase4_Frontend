/*
  Screen 7 - Find opportunities (FR-S2, FR-S6, FR-AI6)
  States: results, no results (+ Clear filters), "best match" without a resume,
  keyword results only while the AI is down. Never shows match labels here.
*/
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SearchX, SlidersHorizontal } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { companyNameOf, getListingCompany, getOpenListings } from '../../../store/selectors'
import { useAuth } from '../../../context/authContext'
import { useSavedListings } from '../../../hooks/useSavedListings'
import { useListingFilters } from '../../../hooks/useListingFilters'
import { useAiStatus } from '../../../hooks/useAiStatus'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { SORT_OPTIONS } from '../../../lib/constants'
import { EMPTY_FILTERS, searchListings } from '../../../lib/search'
import { scoreListing } from '../../../lib/match'
import { cn } from '../../../lib/cn'
import { PATHS } from '../../../routes/paths'
import { Alert, Button, EmptyState, Input, PageHeader, Select } from '../../../components/ui'
import FilterSidebar from '../components/FilterSidebar'
import SearchResultRow from '../components/SearchResultRow'

export default function SearchPage() {
  useDocumentTitle('Find opportunities')
  const { db } = useStore()
  const { profile } = useAuth()
  const { isSaved, toggleSave } = useSavedListings()
  const { aiAvailable } = useAiStatus()
  const { filters, setFilters, sort, setSort, clearAll } = useListingFilters('best')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const hasResume = Boolean(profile?.resume)
  const bestWithoutResume = sort === 'best' && !hasResume
  const effectiveSort = bestWithoutResume ? 'newest' : sort

  const { results, keywordCount } = searchListings(getOpenListings(db), filters, {
    companyNameOf: (l) => companyNameOf(db, l),
    sort: effectiveSort,
    scoreOf: (l) => scoreListing(profile, l),
  })

  // FR-AI5 / FR-AI6: without the AI only the keyword part of the search works
  const keywordOnly = !aiAvailable && filters.q.trim() !== ''
  const shown = keywordOnly ? results.slice(0, keywordCount) : results

  return (
    <div className="pb-4">
      <PageHeader eyebrow="Student workspace" title="Find opportunities" subtitle="Explore training opportunities that fit your goals." />

      {/* search + sort */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-3 sm:flex-row sm:items-end sm:p-4">
        <Input
          className="flex-1"
          icon={Search}
          aria-label="Search"
          placeholder="Search by role, company, or keyword"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <div className="flex items-end gap-2">
          <Select
            label="Sort by"
            className="flex-1 sm:w-48"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            className="h-11 lg:hidden"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Filters
          </Button>
        </div>
      </div>

      {bestWithoutResume && (
        <Alert
          tone="info"
          className="mt-4"
          title="Upload your resume to sort by best match"
          action={
            <Link to={PATHS.student.profile} className="text-xs font-semibold whitespace-nowrap text-primary hover:underline">
              Go to profile
            </Link>
          }
        >
          Results are sorted by newest for now.
        </Alert>
      )}
      {keywordOnly && (
        <Alert tone="warning" className="mt-4" title="Showing keyword results only">
          Smart search is unavailable right now, so related results are hidden.
        </Alert>
      )}

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[230px_1fr]">
        <aside className={cn(!filtersOpen && 'hidden', 'lg:sticky lg:top-24 lg:block')}>
          <FilterSidebar filters={filters} onChange={setFilters} onClear={() => setFilters({ ...EMPTY_FILTERS, q: filters.q })} />
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between text-xs">
            <p className="font-semibold text-ink">
              {shown.length} {shown.length === 1 ? 'opportunity' : 'opportunities'}
            </p>
            <p className="text-muted">Updated today</p>
          </div>

          {shown.length === 0 ? (
            <div className="rounded-xl border border-line bg-white">
              <EmptyState
                icon={SearchX}
                title="No listings match your filters"
                message="Try a different keyword or remove some filters."
                action={<Button onClick={clearAll}>Clear filters</Button>}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {shown.map((listing) => {
                const company = getListingCompany(db, listing)
                return (
                  <SearchResultRow
                    key={listing.id}
                    listing={listing}
                    companyName={company?.name ?? ''}
                    companyLogo={company?.logo}
                    saved={isSaved(listing.id)}
                    onToggleSave={() => toggleSave(listing.id)}
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

