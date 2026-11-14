import { Construction } from 'lucide-react'
import PageHeader from './ui/PageHeader'

/**
 * Temporary page used until the owner of a screen builds it on their branch.
 * Replace the whole placeholder file with the real page - don't edit this component.
 */
export default function ComingSoon({ eyebrow, title, owner, requirements }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-white px-6 py-14 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-warning-soft text-warning">
          <Construction className="size-5" />
        </div>
        <p className="mt-4 font-serif text-xl font-bold">This screen is being built</p>
        <p className="mt-1 text-sm text-muted">
          Owner: {owner}
          {requirements && ` · Covers ${requirements}`}
        </p>
      </div>
    </>
  )
}
