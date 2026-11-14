import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { ACCOUNT_STATUS, ROLES } from '../lib/constants'
import { HOME_BY_ROLE, PATHS } from './paths'

/**
 * Only lets the given role through (FR-A5: protected pages need a login, NFR-6: role checks).
 *  - guests go to /login and come back afterwards (?next=...)
 *  - a logged-in user with the wrong role goes to their own dashboard
 *  - a company that is still pending/rejected can only see /company/pending
 */
export default function ProtectedRoute({ role, allowPendingCompany = false }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${PATHS.login}?next=${next}`} replace />
  }

  if (role && user.role !== role) return <Navigate to={HOME_BY_ROLE[user.role]} replace />

  const companyNotApproved =
    user.role === ROLES.COMPANY && [ACCOUNT_STATUS.PENDING, ACCOUNT_STATUS.REJECTED].includes(user.status)
  if (companyNotApproved && !allowPendingCompany) return <Navigate to={PATHS.companyPending} replace />

  return <Outlet />
}
