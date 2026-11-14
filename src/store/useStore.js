import { useContext } from 'react'
import { StoreContext } from './storeContext'

/**
 * Access the data store from any component.
 *
 *   const { db, insert, update, remove, setCollection, transaction } = useStore()
 *
 *   db.listings                         -> array of all listings
 *   insert('saved', { id, ... })        -> adds a row at the top of a collection
 *   update('listings', id, { status })  -> merges fields into one row
 *   update('listings', id, (row) => ({ openings: row.openings + 1 }))
 *   remove('saved', id)                 -> deletes one row
 *   setCollection('shortlistTables', (rows) => rows.filter(...))
 *   transaction((db) => ({ ...db, a: ..., b: ... }))  -> change many collections at once
 *
 * Collections that don't exist yet are created automatically the first time you insert into them,
 * so a feature can add its own collection WITHOUT editing the store files.
 */
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

/**
 * Read one collection. Returns [] if it doesn't exist yet.
 *   const listings = useCollection('listings')
 */
export function useCollection(name) {
  const { db } = useStore()
  return db[name] ?? []
}
