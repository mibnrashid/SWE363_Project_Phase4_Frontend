import { cn } from '../../lib/cn'
import { initials } from '../../lib/format'

/**
 * Initials in a box (companies) or a circle (people), like the prototype ("AD", "NA").
 *
 * <Avatar name="Aramco Digital" />                 // square, light grey
 * <Avatar name="Nora Alqahtani" round dark />      // round, teal
 * <Avatar name="stc" text="stc" />                 // custom text
 * <Avatar src={logoDataUrl} name="Tamara" />      // shows an uploaded logo
 */
export default function Avatar({ name = '', text, src, round = false, dark = false, size = 'md', className }) {
  const sizes = { sm: 'size-8 text-[11px]', md: 'size-10 text-xs', lg: 'size-14 text-sm' }
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden font-bold',
        round ? 'rounded-full' : 'rounded-lg border border-line',
        dark ? 'bg-primary text-white' : 'bg-[#f0f0ed] text-ink',
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : (text ?? initials(name))}
    </div>
  )
}
