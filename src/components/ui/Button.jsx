import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

const variants = {
  primary: 'bg-primary text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-primary-dark',
  secondary: 'border border-line bg-white text-ink hover:bg-canvas',
  ghost: 'text-ink hover:bg-black/5',
  link: 'px-0! text-primary hover:underline',
  danger: 'bg-danger text-white hover:bg-[#9a1d14]',
  'danger-outline': 'border border-danger/40 bg-white text-danger hover:bg-danger-soft',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
}

/**
 * Button used everywhere in the app.
 *
 * <Button>Save</Button>
 * <Button variant="secondary" size="sm" icon={Bookmark}>Save</Button>
 * <Button to="/signup">Sign up</Button>            // renders a router Link
 * <Button loading>Submitting...</Button>
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  to,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:opacity-50',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )

  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" />}
      {children}
      {IconRight && <IconRight className="size-4" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}
