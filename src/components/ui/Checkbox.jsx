import { cn } from '../../lib/cn'

/**
 * <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} label="I agree" />
 * label can be a string or JSX.
 */
export default function Checkbox({ label, error, className, ...rest }) {
  return (
    <div className={className}>
      <label className="inline-flex cursor-pointer items-start gap-2 text-[13px] text-body">
        <input
          type="checkbox"
          className={cn('mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-primary', error && 'outline outline-danger')}
          {...rest}
        />
        {label && <span>{label}</span>}
      </label>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
