/**
 * Top of every logged-in page: eyebrow + big serif title + subtitle + optional buttons on the right.
 *
 * <PageHeader eyebrow="Student workspace" title="My applications"
 *   subtitle="Track every application in one place."
 *   actions={<Button icon={Plus}>Add external application</Button>} />
 */
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl leading-tight sm:text-[40px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
