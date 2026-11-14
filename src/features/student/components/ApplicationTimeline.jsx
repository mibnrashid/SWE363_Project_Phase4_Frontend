import { Check } from 'lucide-react'
import { APP_STATUS } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { cn } from '../../../lib/cn'

const TITLE = {
  [APP_STATUS.APPLIED]: 'Application submitted',
  [APP_STATUS.UNDER_REVIEW]: 'Under review',
  [APP_STATUS.SHORT_LISTED]: 'Short-Listed',
  [APP_STATUS.ACCEPTED]: 'Offer accepted',
  [APP_STATUS.REJECTED]: 'Not selected',
  [APP_STATUS.WITHDRAWN]: 'Withdrawn',
}

// steps still to come for an active application (shown greyed)
const NEXT_STEPS = {
  [APP_STATUS.APPLIED]: [APP_STATUS.UNDER_REVIEW, APP_STATUS.SHORT_LISTED, 'decision'],
  [APP_STATUS.UNDER_REVIEW]: [APP_STATUS.SHORT_LISTED, 'decision'],
  [APP_STATUS.SHORT_LISTED]: ['decision'],
}

/**
 * Vertical "Application progress" timeline in the tracker drawer (FR-S8).
 * history: [{ status, at, note }]
 */
export default function ApplicationTimeline({ history = [], status }) {
  const done = history.length > 0 ? history : [{ status, at: null, note: '' }]
  const upcoming = (NEXT_STEPS[status] ?? []).map((s) => ({
    key: s,
    title: s === 'decision' ? 'Decision' : TITLE[s],
    sub: s === 'decision' ? 'Pending' : 'Next step',
  }))

  const steps = [
    ...done.map((h, i) => ({
      key: `${h.status}-${i}`,
      title: TITLE[h.status] ?? h.status,
      sub: [h.at && formatDate(h.at), h.note].filter(Boolean).join(' · '),
      state: i === done.length - 1 && upcoming.length > 0 ? 'current' : 'done',
    })),
    ...upcoming.map((u) => ({ ...u, state: 'todo' })),
  ]

  return (
    <ol>
      {steps.map((step, i) => (
        <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && <span className="absolute top-6 bottom-0 left-[11px] w-px bg-line" />}
          <span
            className={cn(
              'relative grid size-6 shrink-0 place-items-center rounded-full border-2',
              step.state === 'done' && 'border-primary bg-primary text-white',
              step.state === 'current' && 'border-primary bg-primary-soft',
              step.state === 'todo' && 'border-line bg-white',
            )}
          >
            {step.state === 'done' && <Check className="size-3.5" />}
            {step.state === 'current' && <span className="size-2 rounded-full bg-primary" />}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className={cn('text-[13px] font-semibold', step.state === 'todo' ? 'text-muted' : 'text-ink')}>{step.title}</p>
            {step.sub && <p className="mt-0.5 text-[11px] text-muted">{step.sub}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
