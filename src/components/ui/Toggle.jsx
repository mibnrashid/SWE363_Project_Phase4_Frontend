import { cn } from '../../lib/cn'

/**
 * On/off switch (used in settings and reminder switches).
 *
 * <Toggle checked={on} onChange={setOn} label="In-app notifications" />
 * onChange receives the new boolean value.
 */
export default function Toggle({ checked, onChange, label, disabled, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-[#cfd3d1]',
        disabled && 'opacity-50',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block size-[18px] rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}
