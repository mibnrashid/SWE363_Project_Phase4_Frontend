import { Compass } from 'lucide-react'
import { useAuth } from '../../../context/authContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { Button } from '../../../components/ui'
import { HOME_BY_ROLE, PATHS } from '../../../routes/paths'

// 404 page for unknown URLs
export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  const { user } = useAuth()
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
        <Compass className="size-6" />
      </div>
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="mt-2 text-4xl">We can&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-sm text-body">The link may be broken or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button to={user ? HOME_BY_ROLE[user.role] : PATHS.home}>{user ? 'Go to dashboard' : 'Browse opportunities'}</Button>
      </div>
    </div>
  )
}
