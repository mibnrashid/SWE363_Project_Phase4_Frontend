/*
  Screen 1 - Landing / guest browse (FR-G1, FR-AI6)
  States: normal, no results ("No listings match your filters" + Clear filters), "log in to save" prompt.
*/
import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { companyNameOf, getListingCompany, getOpenListings } from '../../../store/selectors'
import { useSavedListings } from '../../../hooks/useSavedListings'
import { useListingFilters } from '../../../hooks/useListingFilters'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { searchListings } from '../../../lib/search'
import { ACCOUNT_STATUS, ROLES } from '../../../lib/constants'
import { Button, EmptyState } from '../../../components/ui'
import ListingCard from '../../../components/listings/ListingCard'
import FilterBar from '../../../components/listings/FilterBar'
import LoginPromptModal from '../../../components/listings/LoginPromptModal'
import HeroSearch from '../components/HeroSearch'
import InfoSections from '../components/InfoSections'

export default function LandingPage() {
  useDocumentTitle('Find training that moves you forward')
  const { db } = useStore()
  const { filters, setFilters, clearAll } = useListingFilters()
  const { isSaved, toggleSave, canSave } = useSavedListings()
  const [promptOpen, setPromptOpen] = useState(false)

  const open = useMemo(() => getOpenListings(db), [db])
  const { results } = useMemo(
    () => searchListings(open, filters, { companyNameOf: (l) => companyNameOf(db, l), sort: 'newest' }),
    [db, open, filters],
  )

  const stats = {
    listings: open.length,
    companies: db.accounts.filter((a) => a.role === ROLES.COMPANY && a.status === ACCOUNT_STATUS.ACTIVE).length,
    cities: new Set(open.map((l) => l.city)).size,
  }

  const onSave = (listingId) => {
    // FR-G2: guests (and companies/admins) are asked to log in as a student
    if (!canSave) setPromptOpen(true)
    else toggleSave(listingId)
  }

  const onHeroSearch = ({ q, city }) => {
    setFilters({ ...filters, q, city })
    document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-night text-white">
        <div className="pointer-events-none absolute top-0 -right-24 hidden size-[560px] rounded-full border-[80px] border-night-soft/80 md:block" />
        <div className="pointer-events-none absolute top-24 right-10 hidden size-[340px] rounded-full bg-night-soft/40 md:block" />
        <div className="relative mx-auto max-w-[1240px] px-4 py-16 sm:px-8 sm:py-20">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-mint uppercase">Your career starts here</p>
          <h1 className="mt-4 max-w-xl text-[40px] leading-[1.08] font-normal sm:text-[52px]">
            Find training that moves you <em className="text-mint">forward.</em>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80">
            Discover Co-op, internship, and summer training opportunities from leading companies across Saudi Arabia.
          </p>
          <div className="mt-8 max-w-[944px]">
            <HeroSearch key={filters.q} q={filters.q} city={filters.city} onSearch={onHeroSearch} />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-xs text-white/70">
            <span>
              <strong className="mr-1.5 text-white">{stats.listings}</strong>active opportunities
            </span>
            <span>
              <strong className="mr-1.5 text-white">{stats.companies}</strong>verified companies
            </span>
            <span>
              <strong className="mr-1.5 text-white">{stats.cities}</strong>cities across KSA
            </span>
          </div>
        </div>
      </section>

      {/* listings */}
      <section id="opportunities" className="container-page scroll-mt-16 py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Explore opportunities</p>
            <h2 className="mt-2 text-3xl sm:text-[34px]">Find your next opportunity</h2>
          </div>
          <p className="text-sm text-muted">
            {results.length} {results.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
        </div>

        <FilterBar className="mt-6" filters={filters} onChange={setFilters} />

        {filters.q && (
          <p className="mt-4 text-sm text-body">
            Results for <span className="font-semibold text-ink">&ldquo;{filters.q}&rdquo;</span>{' '}
            <button type="button" className="ml-1 text-primary hover:underline" onClick={() => setFilters({ ...filters, q: '' })}>
              Clear search
            </button>
          </p>
        )}

        {results.length === 0 ? (
          <div className="mt-6 rounded-xl border border-line bg-white">
            <EmptyState
              icon={SearchX}
              title="No listings match your filters"
              message="Try a different keyword or remove some filters."
              action={
                <Button variant="secondary" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((listing) => {
              const company = getListingCompany(db, listing)
              return (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  companyName={company?.name ?? ''}
                  companyLogo={company?.logo}
                  saved={isSaved(listing.id)}
                  onToggleSave={() => onSave(listing.id)}
                />
              )
            })}
          </div>
        )}
      </section>

      <InfoSections />
      <LoginPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  )
}
