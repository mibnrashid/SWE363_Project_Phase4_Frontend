import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildSeed } from '../data/seed'
import { runSystemJobs } from './systemJobs'
import { StoreContext } from './storeContext'

const STORAGE_KEY = 'internconnect-data-v1'

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // corrupted storage -> start again from the seed
  }
  return buildSeed()
}

/**
 * Holds all app data (our "fake database") and saves it to localStorage,
 * so changes survive a page refresh. Use the hooks in ./useStore.js, not this file.
 */
export default function StoreProvider({ children }) {
  const [db, setDb] = useState(() => runSystemJobs(loadInitial()))
  const firstSave = useRef(true)

  // save on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch (err) {
      if (firstSave.current) console.warn('Could not save data to localStorage (file too big?)', err)
    }
    firstSave.current = false
  }, [db])

  // FR-SYS1 / FR-SYS2 / FR-SYS3: run the "scheduled jobs" every minute while the app is open
  useEffect(() => {
    const timer = setInterval(() => setDb((current) => runSystemJobs(current)), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const insert = useCallback((collection, item) => {
    setDb((current) => ({ ...current, [collection]: [item, ...(current[collection] ?? [])] }))
    return item
  }, [])

  const update = useCallback((collection, id, patch) => {
    setDb((current) => ({
      ...current,
      [collection]: (current[collection] ?? []).map((row) =>
        row.id === id ? { ...row, ...(typeof patch === 'function' ? patch(row) : patch) } : row,
      ),
    }))
  }, [])

  const remove = useCallback((collection, id) => {
    setDb((current) => ({ ...current, [collection]: (current[collection] ?? []).filter((row) => row.id !== id) }))
  }, [])

  // replace a whole collection: setCollection('saved', (rows) => rows.filter(...))
  const setCollection = useCallback((collection, value) => {
    setDb((current) => ({
      ...current,
      [collection]: typeof value === 'function' ? value(current[collection] ?? []) : value,
    }))
  }, [])

  // change several collections in one go: transaction((db) => ({ ...db, applications: [...] }))
  const transaction = useCallback((fn) => setDb((current) => fn(current)), [])

  const resetDemoData = useCallback(() => setDb(runSystemJobs(buildSeed())), [])

  const value = useMemo(
    () => ({ db, insert, update, remove, setCollection, transaction, resetDemoData }),
    [db, insert, update, remove, setCollection, transaction, resetDemoData],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
