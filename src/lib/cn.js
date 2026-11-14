import { twMerge } from 'tailwind-merge'

// Joins class names, skips empty values, and lets later Tailwind classes win
// over earlier ones that do the same thing:
// cn('px-2 inline-flex', isActive && 'bg-primary', 'hidden sm:inline-flex') -> 'px-2 bg-primary hidden sm:inline-flex'
export function cn(...classes) {
  return twMerge(classes.filter(Boolean).join(' '))
}
