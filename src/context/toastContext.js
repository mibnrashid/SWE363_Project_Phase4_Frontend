import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/**
 * Show a short message in the corner (NFR-4: every action shows success or failure).
 *
 *   const toast = useToast()
 *   toast.success('Application submitted.')
 *   toast.error('Please fix the highlighted fields.')
 *   toast.info('Saved as draft.')
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
