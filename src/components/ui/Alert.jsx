import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'

const styles = {
  info: { box: 'border-info/20 bg-info-soft text-info', icon: Info },
  success: { box: 'border-success/20 bg-success-soft text-success', icon: CheckCircle2 },
  warning: { box: 'border-warning/25 bg-warning-soft text-warning', icon: TriangleAlert },
  danger: { box: 'border-danger/20 bg-danger-soft text-danger', icon: AlertCircle },
}

/**
 * Inline message box.
 * <Alert tone="danger" title="Account temporarily locked">Too many attempts...</Alert>
 * <Alert tone="info">Showing keyword results only</Alert>
 */
export default function Alert({ tone = 'info', title, icon, children, action, className }) {
  const { box, icon: DefaultIcon } = styles[tone]
  const Icon = icon ?? DefaultIcon
  return (
    <div className={cn('flex gap-3 rounded-lg border px-4 py-3 text-[13px]', box, className)} role="status">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn('text-body', title && 'mt-0.5')}>{children}</div>}
      </div>
      {action}
    </div>
  )
}
