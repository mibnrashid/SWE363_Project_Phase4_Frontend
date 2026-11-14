/*
  My postings (screen 14, FR-C3 / FR-C4)
  Tabs with counts, search and sort, then the shared postings table with close / reopen.
*/
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { POSTING_STATUS } from '../../../lib/constants'
import { PATHS } from '../../../routes/paths'
import { Button, Card, EmptyState, Input, PageHeader, Select, Tabs } from '../../../components/ui'
import PostingsTable from '../components/PostingsTable'
import { POSTING_TABS, filterPostings, postingsForCompany, sortPostings } from '../utils/postings'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'applicants', label: 'Most applicants' },
]

export default function PostingsPage() {
  useDocumentTitle('My postings')
  const { db } = useStore()
  const { user } = useAuth()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')

  const listings = postingsForCompany(db, user.id)
  const filtered = filterPostings(listings, tab, query)
  const visible = sortPostings(filtered, sort, db)

  const counts = {
    all: listings.length,
    open: listings.filter((listing) => listing.status === POSTING_STATUS.OPEN).length,
    closed: listings.filter((listing) => listing.status === POSTING_STATUS.CLOSED).length,
    removed: listings.filter((listing) => listing.status === POSTING_STATUS.REMOVED).length,
  }

  const tabs = POSTING_TABS.map((item) => ({ ...item, count: counts[item.value] }))
  const emptyMessage = query.trim()
    ? 'No postings match your search.'
    : tab === 'all'
      ? 'No postings yet.'
      : `No ${tab} postings.`

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Company workspace"
        title="My postings"
        subtitle="Create and manage your training opportunities."
        actions={
          <Button icon={Plus} to={PATHS.company.newPosting}>
            New posting
          </Button>
        }
      />

      <Tabs value={tab} onChange={setTab} options={tabs} />

      <Card className="mt-5">
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Input
            className="sm:w-72"
            icon={Search}
            aria-label="Search postings"
            placeholder="Search postings"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            className="sm:w-48"
            aria-label="Sort postings"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          />
        </div>

        {visible.length === 0 ? (
          <div className="border-t border-line">
            <EmptyState
              icon={Search}
              title={emptyMessage}
              message={query.trim() ? 'Try another title, city or training type.' : 'Post a new opportunity to start receiving applications.'}
              action={
                query.trim() ? (
                  <Button variant="secondary" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                ) : (
                  <Button icon={Plus} to={PATHS.company.newPosting}>
                    New posting
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="border-t border-line pt-5">
            <PostingsTable listings={visible} db={db} />
          </div>
        )}
      </Card>
    </div>
  )
}
