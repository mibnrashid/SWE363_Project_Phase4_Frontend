import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useToast } from '../../context/toastContext'
import ConfirmDialog from '../ui/ConfirmDialog'
import Logo from './Logo'

export default function Footer() {
  const { resetDemoData } = useStore()
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs">Team 14 · SWE 363-01 · Front-end prototype with demo data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span>© {new Date().getFullYear()} InternConnect</span>
          <button type="button" onClick={() => setConfirmOpen(true)} className="font-medium text-primary hover:underline">
            Reset demo data
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Reset demo data?"
        message="All changes you made in this browser (applications, postings, saved listings ...) will be replaced with the original demo data."
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          resetDemoData()
          setConfirmOpen(false)
          toast.success('Demo data was reset.')
        }}
      />
    </footer>
  )
}
