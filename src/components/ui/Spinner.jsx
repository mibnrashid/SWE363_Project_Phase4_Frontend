import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

// <Spinner label="We're analysing your resume" />
export default function Spinner({ label, className }) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted', className)}>
      <Loader2 className="size-4 animate-spin text-primary" />
      {label}
    </div>
  )
}
