import { BellRing, Building2, ClipboardList, FileSearch, ListChecks, Search, Sparkles, UserRoundPen, Users } from 'lucide-react'
import { Button } from '../../../components/ui'
import { PATHS } from '../../../routes/paths'

const studentSteps = [
  { icon: UserRoundPen, title: 'Build your profile', text: 'Add your major, skills and a PDF resume so we can suggest training that fits you.' },
  { icon: Search, title: 'Search and save', text: 'Filter by major, city, training type, duration, start date and pay. Save listings and get a reminder 2 days before they close.' },
  { icon: ClipboardList, title: 'Apply and track', text: 'Apply to InternConnect postings in a few clicks, and record applications from other websites in the same tracker.' },
]

const companyPoints = [
  { icon: FileSearch, text: 'Post Co-op, internship and summer training roles to students who are only looking for training.' },
  { icon: Users, text: 'Review applicants, read resumes and screening answers in one place.' },
  { icon: Sparkles, text: 'Build shortlist tables by hand or ask the assistant. Your team makes every decision.' },
]

// "How it works" + "For companies" sections on the landing page (linked from the guest navbar)
export default function InfoSections() {
  return (
    <>
      <section id="how-it-works" className="scroll-mt-20 border-t border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 max-w-xl text-3xl sm:text-4xl">From search to offer, in one place</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {studentSteps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-xl border border-line bg-canvas p-6">
                <div className="flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-serif text-2xl text-primary/70">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 rounded-xl border border-line p-6 md:grid-cols-2">
            <div className="flex gap-3">
              <ListChecks className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-body">
                <span className="font-semibold text-ink">Posted on InternConnect:</span> apply through the platform and see status updates from
                the company in your tracker.
              </p>
            </div>
            <div className="flex gap-3">
              <BellRing className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-body">
                <span className="font-semibold text-ink">Listed on another website:</span> apply on the original site, then add it to your
                tracker and update the status yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="for-companies" className="scroll-mt-20 py-16 sm:py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-2xl bg-night px-6 py-10 text-white sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -top-40 -right-40 size-[460px] rounded-full border-[56px] border-night-soft" />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-mint uppercase">For companies</p>
                <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">Hiring trainees? Reach students who are looking for training.</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  Register with your Commercial Registration number. Once an admin approves your company, you can publish postings straight
                  away.
                </p>
                <Button to={`${PATHS.signup}?role=company`} size="lg" icon={Building2} className="mt-7">
                  Register your company
                </Button>
              </div>
              <ul className="space-y-4">
                {companyPoints.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-mint" />
                    <span className="text-sm text-white/85">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
