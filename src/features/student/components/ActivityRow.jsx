import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Avatar } from '../../../components/ui'

/**
 * One row in the dashboard "Closing soon" / "Recent applications" cards:
 * avatar, title, subtitle, something on the right and a chevron. The whole row is a link.
 */
export default function ActivityRow({ to, avatarName, avatarSrc, title, subtitle, right }) {
  return (
    <li className="border-t border-line first:border-0">
      <Link to={to} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-canvas">
        <Avatar name={avatarName} text={avatarName.length <= 3 ? avatarName : undefined} src={avatarSrc} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
          <p className="truncate text-[11px] text-muted">{subtitle}</p>
        </div>
        <div className="shrink-0">{right}</div>
        <ChevronRight className="size-4 shrink-0 text-ink" />
      </Link>
    </li>
  )
}
