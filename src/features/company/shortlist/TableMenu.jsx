// The ≡ menu on each table card: Rename, Sort by, Columns, Delete table
import { useEffect, useRef, useState } from 'react'
import { Check, Menu, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { TABLE_COLUMNS, TABLE_SORTS } from './tableActions'

export default function TableMenu({ table, onRename, onSort, onToggleColumn, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = (fn) => () => {
    setOpen(false)
    fn()
  }
  const columns = table.columns ?? ['major']
  const item = 'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink hover:bg-canvas'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Options for ${table.name}`}
        aria-expanded={open}
        className="grid size-8 place-items-center rounded-md text-muted hover:bg-canvas hover:text-ink"
      >
        <Menu className="size-4" />
      </button>

      {open && (
        <div className="absolute top-9 right-0 z-30 w-56 rounded-xl border border-line bg-white p-1.5 shadow-lg" role="menu">
          <button type="button" className={item} onClick={run(onRename)}>
            <Pencil className="size-3.5 text-muted" /> Rename
          </button>

          <p className="mt-1.5 px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-muted uppercase">Sort by</p>
          {TABLE_SORTS.map((s) => (
            <button key={s.value} type="button" className={item} onClick={run(() => onSort(s.value))}>
              <Check className={cn('size-3.5', table.sortBy === s.value ? 'text-primary' : 'invisible')} />
              {s.label}
            </button>
          ))}

          <p className="mt-1.5 px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-muted uppercase">Columns</p>
          {TABLE_COLUMNS.map((c) => (
            <label key={c.key} className={cn(item, 'cursor-pointer')}>
              <input
                type="checkbox"
                className="size-3.5 accent-primary"
                checked={columns.includes(c.key)}
                onChange={() => onToggleColumn(c.key)}
              />
              {c.label}
            </label>
          ))}

          <div className="my-1.5 border-t border-line" />
          <button type="button" className={cn(item, 'text-danger hover:bg-danger-soft')} onClick={run(onDelete)}>
            <Trash2 className="size-3.5" /> Delete table
          </button>
        </div>
      )}
    </div>
  )
}
