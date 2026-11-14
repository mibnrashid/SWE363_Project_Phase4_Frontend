import Badge from './Badge'
import { APP_STATUS } from '../../lib/constants'

// colour for each application status (Phase 3 status list)
const toneByStatus = {
  [APP_STATUS.APPLIED]: 'neutral',
  [APP_STATUS.UNDER_REVIEW]: 'info',
  [APP_STATUS.SHORT_LISTED]: 'teal',
  [APP_STATUS.ACCEPTED]: 'success',
  [APP_STATUS.REJECTED]: 'danger',
  [APP_STATUS.WITHDRAWN]: 'neutral',
}

/**
 * <StatusBadge status={application.status} />
 * Works with every value in APP_STATUS. Unknown values fall back to grey.
 */
export default function StatusBadge({ status, className }) {
  return (
    <Badge tone={toneByStatus[status] ?? 'neutral'} className={className}>
      {status}
    </Badge>
  )
}
