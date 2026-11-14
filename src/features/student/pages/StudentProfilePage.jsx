/*
  Screen 12 - Student profile (FR-S1, FR-AI1)
  Sections: personal details, academic information, skills & interests, resume.
  States: validation errors next to fields, resume upload (wrong file, pending, analysed, unreadable, AI down).
*/
import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { ACADEMIC_LEVELS, CITIES, MAJORS, TRAINING_TYPES, UNIVERSITIES } from '../../../lib/constants'
import { isValid, required, validateGpa, validatePhone } from '../../../lib/validation'
import { cn } from '../../../lib/cn'
import { Button, Input, PageHeader, Select, Textarea } from '../../../components/ui'
import ChipGroup from '../components/ChipGroup'
import ResumeSection from '../components/ResumeSection'
import { profileCompletion } from '../utils/profileCompletion'

const SECTIONS = [
  { id: 'personal', label: 'Personal details' },
  { id: 'academic', label: 'Academic information' },
  { id: 'skills', label: 'Skills & interests' },
  { id: 'resume', label: 'Resume' },
]

const GPA_SCALES = [
  { value: '4', label: '4.0' },
  { value: '5', label: '5.0' },
]

// ISO date <-> "YYYY-MM" for the month input
const toMonth = (iso) => (iso ? String(iso).slice(0, 7) : '')
const fromMonth = (month) => (month ? new Date(`${month}-01T00:00:00`).toISOString() : '')

function formFrom(profile) {
  return {
    name: profile.name ?? '',
    phone: profile.phone ?? '',
    bio: profile.bio ?? '',
    university: profile.university ?? '',
    academicLevel: profile.academicLevel ?? '',
    major: profile.major ?? '',
    graduationMonth: toMonth(profile.graduationDate),
    gpa: profile.gpa ?? '',
    gpaScale: String(profile.gpaScale ?? 4),
    skills: profile.skills ?? [],
    preferredCities: profile.preferredCities ?? [],
    preferredTypes: profile.preferredTypes ?? [],
  }
}

function SectionCard({ id, title, subtitle, children }) {
  return (
    <section id={`profile-${id}`} className="scroll-mt-24 rounded-xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      <div className="mt-4 border-t border-line pt-5">{children}</div>
    </section>
  )
}

export default function StudentProfilePage() {
  useDocumentTitle('Your profile')
  const { update } = useStore()
  const { user, profile } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState(() => formFrom(profile))
  const [errors, setErrors] = useState({})
  const [skillInput, setSkillInput] = useState('')
  const [activeSection, setActiveSection] = useState('personal')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setValue = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  // strength uses what is on screen right now + the saved resume
  const completion = profileCompletion({ ...form, graduationDate: form.graduationMonth, resume: profile.resume })

  const goTo = (id) => {
    setActiveSection(id)
    document.getElementById(`profile-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const addSkill = () => {
    const skill = skillInput.trim()
    if (!skill) return
    if (form.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      toast.info(`${skill} is already in your skills.`)
      setSkillInput('')
      return
    }
    setValue('skills', [...form.skills, skill])
    setSkillInput('')
  }

  const save = () => {
    const found = {
      name: required(form.name, 'Full name is required.'),
      phone: form.phone.trim() ? validatePhone(form.phone) : '',
      university: required(form.university, 'University is required.'),
      major: required(form.major, 'Major is required.'),
      graduationMonth: required(form.graduationMonth, 'Expected graduation is required.'),
      gpa: validateGpa(form.gpa, form.gpaScale),
    }
    setErrors(found)
    if (!isValid(found)) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    const name = form.name.trim()
    update('students', profile.id, {
      name,
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      university: form.university,
      academicLevel: form.academicLevel,
      major: form.major,
      graduationDate: fromMonth(form.graduationMonth),
      gpa: form.gpa === '' ? null : Number(form.gpa),
      gpaScale: Number(form.gpaScale),
      skills: form.skills,
      preferredCities: form.preferredCities,
      preferredTypes: form.preferredTypes,
    })
    update('accounts', user.id, { name })
    toast.success('Profile saved.')
  }

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Student workspace"
        title="Your profile"
        subtitle="Keep your information current to get more relevant matches."
        actions={<Button onClick={save}>Save changes</Button>}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[210px_1fr]">
        {/* section links + profile strength */}
        <aside className="rounded-xl border border-line bg-white p-2 lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.id)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-left text-[13px] whitespace-nowrap transition-colors',
                  activeSection === s.id ? 'bg-primary-soft font-semibold text-primary' : 'text-body hover:bg-canvas',
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="mx-1 mt-2 border-t border-line px-2 pt-3 pb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Profile strength</span>
              <span className="text-body">{completion.percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ececE8]">
              <div className="h-full rounded-full bg-mint" style={{ width: `${completion.percent}%` }} />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard id="personal" title="Personal details" subtitle="How companies will see and contact you.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" required value={form.name} onChange={set('name')} error={errors.name} />
              <Input label="Email" value={profile.email} disabled hint="Your login email can't be changed here." />
              <Input label="Phone" type="tel" placeholder="+966 5x xxx xxxx" value={form.phone} onChange={set('phone')} error={errors.phone} />
              <Textarea
                label="Short bio"
                className="sm:col-span-2"
                rows={3}
                maxLength={300}
                placeholder="A few sentences about you and what you're looking for."
                value={form.bio}
                onChange={set('bio')}
              />
            </div>
          </SectionCard>

          <SectionCard id="academic" title="Academic information" subtitle="Tell us about your current studies.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="University"
                required
                options={UNIVERSITIES}
                placeholder="Select university"
                value={form.university}
                onChange={set('university')}
                error={errors.university}
              />
              <Select
                label="Academic level"
                options={ACADEMIC_LEVELS}
                placeholder="Select level"
                value={form.academicLevel}
                onChange={set('academicLevel')}
              />
              <Select
                label="Major"
                required
                options={MAJORS}
                placeholder="Select major"
                value={form.major}
                onChange={set('major')}
                error={errors.major}
              />
              <Input
                label="Expected graduation"
                required
                type="month"
                value={form.graduationMonth}
                onChange={set('graduationMonth')}
                error={errors.graduationMonth}
              />
              <Input
                label="GPA"
                type="number"
                step="0.01"
                min="0"
                max={form.gpaScale}
                value={form.gpa}
                onChange={set('gpa')}
                error={errors.gpa}
              />
              <Select label="GPA scale" options={GPA_SCALES} value={form.gpaScale} onChange={set('gpaScale')} />
            </div>
          </SectionCard>

          <SectionCard id="skills" title="Skills & interests" subtitle="Add skills that represent your experience and interests.">
            {form.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <li key={skill} className="inline-flex items-center gap-1 rounded-md bg-primary-soft py-1 pr-1.5 pl-2.5 text-xs font-semibold text-primary">
                    {skill}
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() => setValue('skills', form.skills.filter((s) => s !== skill))}
                      className="grid size-4 place-items-center rounded hover:bg-primary/10"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">No skills yet. Add at least one to get better matches.</p>
            )}
            <div className="mt-3 flex gap-2">
              <Input
                className="flex-1"
                aria-label="Add a skill"
                placeholder="Add a skill"
                value={skillInput}
                maxLength={40}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button variant="secondary" onClick={addSkill} className="h-11">
                Add
              </Button>
            </div>

            <div className="mt-6 flex flex-col gap-5 border-t border-line pt-5">
              <ChipGroup
                label="Preferred cities"
                options={CITIES}
                value={form.preferredCities}
                onChange={(list) => setValue('preferredCities', list)}
              />
              <ChipGroup
                label="Preferred training types"
                options={TRAINING_TYPES}
                value={form.preferredTypes}
                onChange={(list) => setValue('preferredTypes', list)}
              />
            </div>
          </SectionCard>

          <SectionCard id="resume" title="Resume" subtitle="Upload a PDF so we can identify your experience and improve matches.">
            <ResumeSection profile={profile} />
          </SectionCard>

          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
