// big serif title + grey subtitle at the top of every auth form
export default function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="text-[34px] leading-tight font-bold">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
    </div>
  )
}
