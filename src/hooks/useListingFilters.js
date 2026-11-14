import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EMPTY_FILTERS } from '../lib/search'

/**
 * Keeps the search filters in the URL (?q=data&city=Riyadh) so results survive a refresh
 * and the browser back button works. Used by the landing page and the student search page.
 *
 *   const { filters, setFilters, sort, setSort, clearAll } = useListingFilters('newest')
 */
export function useListingFilters(defaultSort = 'newest') {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(() => {
    const f = { ...EMPTY_FILTERS }
    for (const key of Object.keys(EMPTY_FILTERS)) f[key] = params.get(key) ?? ''
    return f
  }, [params])

  const sort = params.get('sort') ?? defaultSort

  const write = useCallback(
    (nextFilters, nextSort) => {
      const p = new URLSearchParams()
      Object.entries(nextFilters).forEach(([k, v]) => v && p.set(k, v))
      if (nextSort && nextSort !== defaultSort) p.set('sort', nextSort)
      setParams(p, { replace: true, preventScrollReset: true })
    },
    [defaultSort, setParams],
  )

  const setFilters = useCallback((next) => write(next, sort), [sort, write])
  const setSort = useCallback((next) => write(filters, next), [filters, write])
  const clearAll = useCallback(() => write(EMPTY_FILTERS, sort), [sort, write])

  return { filters, setFilters, sort, setSort, clearAll }
}
