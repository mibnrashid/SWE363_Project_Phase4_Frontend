import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

// teal "IC" square + wordmark. light = white text for dark backgrounds
export default function Logo({ to = '/', light = false, className }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5', className)} aria-label="InternConnect home">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-[11px] font-bold text-white">IC</span>
      <span className={cn('text-[17px] font-bold tracking-tight', light ? 'text-white' : 'text-ink')}>InternConnect</span>
    </Link>
  )
}
