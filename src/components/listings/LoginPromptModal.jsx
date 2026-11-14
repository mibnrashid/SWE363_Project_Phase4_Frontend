import { useLocation } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { PATHS } from '../../routes/paths'

/**
 * Shown when a guest clicks Apply or Save (FR-G2). After logging in or signing up
 * the user comes back to the same page (the ?next= parameter).
 *
 * <LoginPromptModal open={open} onClose={() => setOpen(false)} />
 */
export default function LoginPromptModal({ open, onClose }) {
  const location = useLocation()
  const next = encodeURIComponent(location.pathname + location.search)

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center pt-2 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <UserRound className="size-6" />
        </div>
        <h2 className="mt-4 text-[28px] font-bold">Log in or sign up</h2>
        <p className="mt-2 max-w-xs text-sm text-body">You need an InternConnect account to apply for or save this opportunity.</p>
        <div className="mt-6 flex w-full flex-col gap-2">
          <Button size="lg" fullWidth to={`${PATHS.signup}?next=${next}`}>
            Create an account
          </Button>
          <Button size="lg" variant="secondary" fullWidth to={`${PATHS.login}?next=${next}`}>
            Log in
          </Button>
        </div>
        <p className="mt-5 text-[11px] text-muted">It only takes a few minutes to get started.</p>
      </div>
    </Modal>
  )
}
