import { cn } from '../../lib/cn'

/**
 * Simple table styling that matches the prototype (grey header, thin row lines).
 * On small screens the table scrolls sideways instead of breaking the layout.
 *
 * <Table>
 *   <thead><tr><Th>Company</Th><Th>City</Th></tr></thead>
 *   <tbody><tr><Td>Aramco</Td><Td>Dhahran</Td></tr></tbody>
 * </Table>
 */
export function Table({ className, children }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-line bg-white', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ className, children, ...rest }) {
  return (
    <th
      className={cn('bg-[#f2f2ef] px-4 py-3 text-[10px] font-semibold tracking-wider text-muted uppercase', className)}
      {...rest}
    >
      {children}
    </th>
  )
}

export function Td({ className, children, ...rest }) {
  return (
    <td className={cn('border-t border-line px-4 py-3 align-middle text-body', className)} {...rest}>
      {children}
    </td>
  )
}
