import { cn } from '../../lib/cn'

const tones = {
  neutral: 'bg-[#efefec] text-body',
  teal: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  dark: 'bg-night text-white',
}

/**
 * Small rounded label.
 * <Badge>Co-op</Badge>
 * <Badge tone="teal">Strong match</Badge>
 * <Badge tone="warning" icon={Clock}>Closes soon</Badge>
 */
export default function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {Icon && <Icon className="size-3" />}
      {children}
    </span>
  )
}
