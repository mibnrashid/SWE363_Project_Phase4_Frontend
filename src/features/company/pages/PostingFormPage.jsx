/*
  Create / edit posting (screens 15 and 16, FR-C2 / FR-C3)
  Sections: basic information, eligibility, compensation & skills, details, screening questions.
  Includes validation, a public-style preview, publish / save changes, and a local draft.
*/
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BriefcaseBusiness, Clock, Eye, MapPin, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { getListing } from '../../../store/selectors'
import {
  ACADEMIC_LEVELS,
  CITIES,
  COMPENSATION,
  LISTING_SOURCE,
  MAJORS,
  POSTING_STATUS,
  TRAINING_TYPES,
  WORK_MODES,
} from '../../../lib/constants'
import { durationLabel, formatLongDate } from '../../../lib/format'
import { isValid } from '../../../lib/validation'
import { makeId } from '../../../lib/ids'
import { PATHS } from '../../../routes/paths'
import { Alert, Badge, Button, Checkbox, EmptyState, Input, Modal, PageHeader, Select, Textarea } from '../../../components/ui'
import ChipsField from '../components/ChipsField'
import {
  DURATION_WEEKS,
  EMPTY_POSTING_FORM,
  formFromListing,
  formToPayload,
  hasApplications,
  validatePostingForm,
} from '../utils/postings'

const STEPS = [
  { id: 'basic', label: 'Basic information', number: 1 },
  { id: 'eligibility', label: 'Eligibility', number: 2 },
  { id: 'compensation', label: 'Compensation & skills', number: 3 },
  { id: 'details', label: 'Opportunity details', number: 4 },
  { id: 'questions', label: 'Screening questions', number: 5 },
]

const SECTION_BY_FIELD = {
  title: 'basic',
  trainingType: 'basic',
  city: 'basic',
  workMode: 'basic',
  durationWeeks: 'basic',
  startDate: 'basic',
  deadline: 'basic',
  openings: 'basic',
  majors: 'eligibility',
  academicLevels: 'eligibility',
  skills: 'compensation',
  description: 'details',
  responsibilities: 'details',
}

function SectionCard({ id, title, subtitle, children }) {
  return (
    <section id={`posting-${id}`} className="scroll-mt-24 rounded-xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      <div className="mt-4 border-t border-line pt-5">{children}</div>
    </section>
  )
}

export default function PostingFormPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { db, insert, update } = useStore()
  const { user, profile } = useAuth()
  const toast = useToast()

  const isEdit = Boolean(listingId)
  const listing = isEdit ? getListing(db, listingId) : null
  useDocumentTitle(isEdit ? 'Edit posting' : 'New posting')

  const [form, setForm] = useState(() => formFromListing(listing))
  const [errors, setErrors] = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [draft, setDraft] = useState(null)
  const [activeStep, setActiveStep] = useState('basic')

  const draftKey = `internconnect-posting-draft-${user.id}`
  const questionsLocked = Boolean(listing && hasApplications(db, listing.id))

  useEffect(() => {
    if (isEdit) return
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) setDraft(JSON.parse(raw))
    } catch {
      // a corrupted draft should never stop the form from opening
    }
  }, [draftKey, isEdit])

  if (isEdit && (!listing || listing.companyId !== user.id)) {
    return (
      <div className="rounded-xl border border-line bg-white">
        <EmptyState
          icon={BriefcaseBusiness}
          title="Posting not found"
          message="This posting does not exist or belongs to another company."
          action={<Button to={PATHS.company.postings}>Back to My postings</Button>}
        />
      </div>
    )
  }

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const goToSection = (id) => {
    setActiveStep(id)
    document.getElementById(`posting-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToFirstError = (found) => {
    const first = Object.keys(found).find((key) => found[key])
    if (!first) return
    goToSection(first.startsWith('question_') ? 'questions' : (SECTION_BY_FIELD[first] ?? 'basic'))
  }

  const validate = () => {
    const found = validatePostingForm(form)
    setErrors(found)
    if (!isValid(found)) {
      toast.error('Please fix the highlighted fields.')
      scrollToFirstError(found)
      return false
    }
    return true
  }

  const saveDraft = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(form))
      toast.success('Draft saved.')
    } catch {
      toast.error('Could not save the draft in this browser.')
    }
  }

  const continueDraft = () => {
    setForm({ ...EMPTY_POSTING_FORM, ...draft })
    setDraft(null)
    toast.info('Draft loaded.')
  }

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey)
    } catch {
      // storage may be blocked
    }
    setDraft(null)
    toast.info('Draft discarded.')
  }

  const publish = () => {
    const payload = formToPayload(form)
    if (isEdit) {
      update('listings', listing.id, {
        ...payload,
        screeningQuestions: questionsLocked ? listing.screeningQuestions : payload.screeningQuestions,
      })
      toast.success('Posting updated.')
    } else {
      insert('listings', {
        ...payload,
        id: makeId('l'),
        source: LISTING_SOURCE.INTERNAL,
        companyId: user.id,
        status: POSTING_STATUS.OPEN,
        postedAt: new Date().toISOString(),
        removedReason: '',
        shortlistApprovedAt: null,
        finalizedAt: null,
        companyName: null,
        externalUrl: null,
      })
      try {
        localStorage.removeItem(draftKey)
      } catch {
        // storage may be blocked
      }
      toast.success('Posting published.')
    }
    navigate(PATHS.company.postings)
  }

  const openPreview = () => {
    if (!validate()) return
    setPreviewOpen(true)
  }

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      screeningQuestions: [
        ...current.screeningQuestions,
        { id: makeId('q'), text: '', type: 'text', required: false },
      ],
    }))
  }

  const updateQuestion = (id, patch) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    }))
  }

  const removeQuestion = (id) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.filter((question) => question.id !== id),
    }))
  }

  const preview = formToPayload(form)
  const durationOptions = DURATION_WEEKS.map((weeks) => ({ value: String(weeks), label: durationLabel(weeks) }))

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Company workspace"
        title={isEdit ? 'Edit posting' : 'Create a new posting'}
        subtitle="Provide clear details to attract the right students."
        actions={
          <>
            {!isEdit && (
              <Button variant="secondary" onClick={saveDraft}>
                Save draft
              </Button>
            )}
            <Button icon={Eye} onClick={openPreview}>
              Preview posting
            </Button>
          </>
        }
      />

      {!isEdit && draft && (
        <Alert
          tone="info"
          title="Continue your draft?"
          className="mb-5"
          action={
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={continueDraft}>
                Continue
              </Button>
              <Button size="sm" variant="secondary" onClick={discardDraft}>
                Discard
              </Button>
            </div>
          }
        >
          You have an unsaved posting draft in this browser.
        </Alert>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0 rounded-xl border border-line bg-white p-2 lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Posting sections">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => goToSection(step.id)}
                className={
                  activeStep === step.id
                    ? 'flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-2.5 text-left text-[13px] font-semibold whitespace-nowrap text-primary'
                    : 'flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] whitespace-nowrap text-body hover:bg-canvas'
                }
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-bold text-primary ring-1 ring-primary/20">
                  {step.number}
                </span>
                {step.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard id="basic" title="Basic information" subtitle="Start with the core details students will see.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                className="sm:col-span-2"
                label="Posting title"
                required
                placeholder="e.g. Software Engineering Co-op"
                value={form.title}
                onChange={set('title')}
                error={errors.title}
              />
              <Select label="Training type" required options={TRAINING_TYPES} placeholder="Select type" value={form.trainingType} onChange={set('trainingType')} error={errors.trainingType} />
              <Select label="City" required options={CITIES} placeholder="Select city" value={form.city} onChange={set('city')} error={errors.city} />
              <Select label="Work mode" required options={WORK_MODES} placeholder="Select mode" value={form.workMode} onChange={set('workMode')} error={errors.workMode} />
              <Select label="Duration" required options={durationOptions} placeholder="Select duration" value={form.durationWeeks} onChange={set('durationWeeks')} error={errors.durationWeeks} />
              <Input label="Start date" required type="date" value={form.startDate} onChange={set('startDate')} error={errors.startDate} />
              <Input label="Application deadline" required type="date" value={form.deadline} onChange={set('deadline')} error={errors.deadline} />
              <Input label="Number of openings" required type="number" min="1" step="1" value={form.openings} onChange={set('openings')} error={errors.openings} />
            </div>
          </SectionCard>

          <SectionCard id="eligibility" title="Eligibility" subtitle="Define who is eligible to apply.">
            <ChipsField
              label="Eligible majors"
              required
              options={MAJORS}
              value={form.majors}
              onChange={(value) => setValue('majors', value)}
              error={errors.majors}
            />
            <fieldset className="mt-6 border-t border-line pt-5">
              <legend className="text-[13px] font-semibold text-ink">
                Academic levels<span className="ml-0.5 text-danger">*</span>
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {ACADEMIC_LEVELS.map((level) => (
                  <Checkbox
                    key={level}
                    label={level}
                    checked={form.academicLevels.includes(level)}
                    onChange={(event) =>
                      setValue(
                        'academicLevels',
                        event.target.checked
                          ? [...form.academicLevels, level]
                          : form.academicLevels.filter((current) => current !== level),
                      )
                    }
                  />
                ))}
              </div>
              {errors.academicLevels && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {errors.academicLevels}
                </p>
              )}
            </fieldset>
          </SectionCard>

          <SectionCard id="compensation" title="Compensation & skills" subtitle="Set compensation and highlight required skills.">
            <fieldset>
              <legend className="text-[13px] font-semibold text-ink">
                Compensation<span className="ml-0.5 text-danger">*</span>
              </legend>
              <div className="mt-2 flex gap-5">
                {COMPENSATION.map((option) => {
                  const paid = option === 'Paid'
                  return (
                    <label key={option} className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-body">
                      <input
                        type="radio"
                        name="compensation"
                        className="size-4 accent-primary"
                        checked={form.paid === paid}
                        onChange={() => setValue('paid', paid)}
                      />
                      {option}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {form.paid && (
              <Input
                className="mt-4 sm:max-w-xs"
                label="Monthly stipend (SAR, optional)"
                type="number"
                min="0"
                step="100"
                placeholder="e.g. 3000"
                value={form.stipend}
                onChange={set('stipend')}
              />
            )}

            <div className="mt-5">
              <ChipsField
                label="Required skills"
                required
                allowCustom
                placeholder="Add a skill"
                value={form.skills}
                onChange={(value) => setValue('skills', value)}
                error={errors.skills}
              />
            </div>
          </SectionCard>

          <SectionCard id="details" title="Opportunity details" subtitle="Help students understand the role and expectations.">
            <div className="flex flex-col gap-4">
              <Input
                label="Short summary"
                hint="One line shown on listing cards."
                placeholder="Build reliable digital products with an agile team."
                value={form.summary}
                onChange={set('summary')}
              />
              <Textarea
                label="Description"
                required
                rows={5}
                placeholder="Describe the opportunity, team, and learning experience."
                value={form.description}
                onChange={set('description')}
                error={errors.description}
              />
              <Textarea
                label="Responsibilities"
                required
                rows={4}
                hint="One responsibility per line."
                placeholder="Build and test features for customer-facing applications."
                value={form.responsibilities}
                onChange={set('responsibilities')}
                error={errors.responsibilities}
              />
              <Textarea
                label="Requirements"
                rows={4}
                hint="Optional. One requirement per line."
                placeholder="Currently pursuing a degree in Computer Science."
                value={form.requirements}
                onChange={set('requirements')}
              />
            </div>
          </SectionCard>

          <SectionCard id="questions" title="Screening questions" subtitle="Optional questions students answer when applying.">
            {questionsLocked ? (
              <div>
                <Alert tone="warning">Screening questions can&apos;t be changed after the first application.</Alert>
                {form.screeningQuestions.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">This posting has no screening questions.</p>
                ) : (
                  <ol className="mt-4 flex flex-col gap-2">
                    {form.screeningQuestions.map((question, index) => (
                      <li key={question.id} className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm">
                        <span className="mr-2 text-xs text-muted">{index + 1}.</span>
                        {question.text}
                        <span className="ml-2 text-[11px] text-muted">
                          ({question.type === 'yesno' ? 'Yes / No' : 'Short text'}
                          {question.required ? ' · required' : ''})
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ) : (
              <>
                {form.screeningQuestions.length === 0 ? (
                  <p className="text-sm text-muted">No screening questions yet.</p>
                ) : (
                  <ol className="flex flex-col gap-4">
                    {form.screeningQuestions.map((question, index) => (
                      <li key={question.id} className="rounded-xl border border-line p-3">
                        <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto] sm:items-start">
                          <Input
                            label={`Question ${index + 1}`}
                            placeholder="e.g. Are you able to start on the listed date?"
                            value={question.text}
                            onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
                            error={errors[`question_${question.id}`]}
                          />
                          <Select
                            label="Answer type"
                            options={[
                              { value: 'text', label: 'Short text' },
                              { value: 'yesno', label: 'Yes / No' },
                            ]}
                            value={question.type}
                            onChange={(event) => updateQuestion(question.id, { type: event.target.value })}
                          />
                          <div className="flex items-center gap-3 pt-0 sm:pt-8">
                            <Checkbox
                              label="Required"
                              checked={question.required}
                              onChange={(event) => updateQuestion(question.id, { required: event.target.checked })}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              aria-label={`Delete question ${index + 1}`}
                              onClick={() => removeQuestion(question.id)}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                <Button variant="secondary" icon={Plus} className="mt-4" onClick={addQuestion}>
                  Add question
                </Button>
              </>
            )}
          </SectionCard>

          <div className="flex flex-wrap justify-end gap-2">
            {!isEdit && (
              <Button variant="secondary" onClick={saveDraft}>
                Save draft
              </Button>
            )}
            <Button icon={Eye} onClick={openPreview}>
              Preview posting
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview posting"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
              Back to edit
            </Button>
            <Button onClick={publish}>{isEdit ? 'Save changes' : 'Publish'}</Button>
          </>
        }
      >
        <article>
          <p className="eyebrow">{profile?.name ?? user.name} · Preview</p>
          <h2 className="mt-2 text-3xl leading-tight">{form.title || 'Untitled posting'}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {form.city || 'City not set'}
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness className="size-3.5" /> {form.trainingType || 'Training type'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {durationLabel(Number(form.durationWeeks))}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-5 text-sm leading-relaxed text-body">
            <section>
              <h3 className="text-lg font-bold text-ink">About the opportunity</h3>
              <p className="mt-1.5">{preview.description || preview.summary || 'No description yet.'}</p>
            </section>
            {preview.responsibilities.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-ink">What you&apos;ll do</h3>
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  {preview.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {preview.requirements.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-ink">What we&apos;re looking for</h3>
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  {preview.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {form.skills.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-ink">Skills</h3>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <Badge key={skill} tone="teal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
            <section className="rounded-lg bg-canvas p-4">
              <h3 className="text-lg font-bold text-ink">Opportunity overview</h3>
              <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Start date</dt>
                  <dd className="text-right font-semibold text-ink">{preview.startDate ? formatLongDate(preview.startDate) : '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Deadline</dt>
                  <dd className="text-right font-semibold text-ink">{preview.deadline ? formatLongDate(preview.deadline) : '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Work mode</dt>
                  <dd className="text-right font-semibold text-ink">{form.workMode || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Compensation</dt>
                  <dd className="text-right font-semibold text-ink">
                    {form.paid ? (form.stipend ? `Paid · SAR ${Number(form.stipend).toLocaleString()}/month` : 'Paid') : 'Unpaid'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Openings</dt>
                  <dd className="text-right font-semibold text-ink">{form.openings || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Eligible majors</dt>
                  <dd className="text-right font-semibold text-ink">{form.majors.length ? form.majors.join(', ') : '—'}</dd>
                </div>
              </dl>
            </section>
          </div>
        </article>
      </Modal>
    </div>
  )
}
