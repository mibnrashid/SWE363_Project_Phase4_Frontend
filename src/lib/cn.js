// Joins class names and skips empty values.
// cn('px-2', isActive && 'bg-primary', null) -> 'px-2 bg-primary'
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
