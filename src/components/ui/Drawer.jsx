import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Panel that slides in from the right (admin "company request" details, applicant preview, ...).
 * Full width on phones.
 *
 * <Drawer open={!!selected} onClose={() => setSelected(null)} footer={<Button>Approve</Button>}>
 *   ...details...
 * </Drawer>
 */
export default function Drawer({ open, onClose, footer, children, width = 'sm:max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-night/45" onClick={onClose} />
      <aside className={`absolute top-0 right-0 flex h-full w-full flex-col bg-white shadow-2xl ${width}`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 grid size-8 place-items-center rounded-full bg-canvas text-muted hover:text-ink"
        >
          <X className="size-4" />
        </button>
        <div className="flex-1 overflow-y-auto p-6 pt-8">{children}</div>
        {footer && <div className="flex flex-wrap gap-2 border-t border-line p-4 sm:p-6">{footer}</div>}
      </aside>
    </div>,
    document.body,
  )
}
