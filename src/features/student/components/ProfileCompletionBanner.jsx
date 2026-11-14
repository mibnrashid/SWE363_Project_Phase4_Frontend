import { Button } from '../../../components/ui'
import { PATHS } from '../../../routes/paths'

// circle with the percentage (dashboard banner, prototype "65%")
function ProgressRing({ percent }) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative grid size-16 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="5" className="stroke-night-soft" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-mint"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <span className="text-sm font-bold text-white">{percent}%</span>
    </div>
  )
}

/**
 * Dark card on the dashboard while the profile is not complete (FR-S3).
 * <ProfileCompletionBanner completion={profileCompletion(profile)} />
 */
export default function ProfileCompletionBanner({ completion }) {
  const { done, total, percent } = completion
  return (
    <section className="flex flex-col gap-5 rounded-xl bg-night p-5 text-white sm:flex-row sm:items-center sm:p-6">
      <ProgressRing percent={percent} />
      <div className="min-w-0 flex-1">
        <h2 className="text-xl leading-snug font-bold text-white">Complete your profile to improve your matches</h2>
        <p className="mt-1 text-[13px] text-white/75">Add your skills and upload a resume so companies can learn more about you.</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-night-soft">
          <div className="h-full rounded-full bg-mint" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-white/60">
          {done} of {total} sections complete
        </p>
      </div>
      <Button to={PATHS.student.profile} size="lg" className="sm:shrink-0">
        Complete profile
      </Button>
    </section>
  )
}
