import assert from 'node:assert/strict'
import { test } from 'node:test'
import { APP_STATUS, POSTING_STATUS } from '../../../lib/constants.js'
import {
  EMPTY_POSTING_FORM,
  countByStatus,
  filterPostings,
  formToPayload,
  sortPostings,
  splitLines,
  toDateInput,
  validateDeadline,
  validatePostingForm,
} from './postings.js'

const validForm = () => ({
  ...EMPTY_POSTING_FORM,
  title: 'Software Engineering Co-op',
  trainingType: 'Co-op',
  city: 'Dhahran',
  workMode: 'On-site',
  durationWeeks: '24',
  startDate: '2099-06-01',
  deadline: '2099-05-01',
  openings: '2',
  majors: ['Software Engineering'],
  academicLevels: ['Senior'],
  skills: ['JavaScript'],
  description: 'Build things.',
  responsibilities: 'Build features.',
})

test('splitLines trims, drops blanks and keeps order', () => {
  assert.deepEqual(splitLines(' one \n\n two\r\n three '), ['one', 'two', 'three'])
})

test('toDateInput keeps only the date part of an ISO value', () => {
  assert.equal(toDateInput('2026-06-30T09:00:00.000Z'), '2026-06-30')
  assert.equal(toDateInput(''), '')
})

test('validateDeadline requires a future date before the start date', () => {
  assert.equal(validateDeadline('', '2099-06-01'), 'Application deadline is required.')
  assert.match(validateDeadline('2000-01-01', '2099-06-01'), /future/)
  assert.match(validateDeadline('2099-06-01', '2099-06-01'), /before the start date/)
  assert.equal(validateDeadline('2099-05-01', '2099-06-01'), '')
})

test('validatePostingForm accepts a complete form and rejects missing sections', () => {
  assert.ok(Object.values(validatePostingForm(validForm())).every((message) => !message))
  const invalid = validatePostingForm({ ...validForm(), majors: [], academicLevels: [], openings: '0' })
  assert.match(invalid.majors, /at least one/)
  assert.match(invalid.academicLevels, /at least one/)
  assert.match(invalid.openings, /at least 1/)
  const missingDetails = validatePostingForm({ ...validForm(), skills: [], responsibilities: '  ' })
  assert.match(missingDetails.skills, /at least one/)
  assert.match(missingDetails.responsibilities, /required/)
})

test('validatePostingForm checks every screening question text', () => {
  const errors = validatePostingForm({
    ...validForm(),
    screeningQuestions: [{ id: 'q_1', text: '   ', type: 'text', required: true }],
  })
  assert.equal(errors.question_q_1, 'Question text is required.')
})

test('formToPayload converts numbers, dates, lines and questions', () => {
  const payload = formToPayload({
    ...validForm(),
    stipend: '3000',
    responsibilities: 'Build features\nReview code',
    requirements: 'Python\nGit',
    screeningQuestions: [{ id: 'q1', text: ' Can you start? ', type: 'yesno', required: true }],
  })
  assert.equal(payload.durationWeeks, 24)
  assert.equal(payload.openings, 2)
  assert.equal(payload.stipend, 3000)
  assert.deepEqual(payload.responsibilities, ['Build features', 'Review code'])
  assert.deepEqual(payload.requirements, ['Python', 'Git'])
  assert.deepEqual(payload.screeningQuestions, [{ id: 'q1', text: 'Can you start?', type: 'yesno', required: true }])
  assert.ok(payload.deadline.startsWith('2099-05-01'))
})

test('filterPostings filters by tab and search text', () => {
  const listings = [
    { id: '1', title: 'Software Engineering Co-op', status: POSTING_STATUS.OPEN, city: 'Dhahran', trainingType: 'Co-op' },
    { id: '2', title: 'Data Intern', status: POSTING_STATUS.CLOSED, city: 'Riyadh', trainingType: 'Internship' },
  ]
  assert.equal(filterPostings(listings, POSTING_STATUS.OPEN).length, 1)
  assert.equal(filterPostings(listings, 'all', 'data').length, 1)
  assert.equal(filterPostings(listings, 'all', 'nothing').length, 0)
})

test('sortPostings sorts newest, deadline and most applicants', () => {
  const db = {
    applications: [
      { listingId: 'old', status: APP_STATUS.APPLIED },
      { listingId: 'new', status: APP_STATUS.APPLIED },
      { listingId: 'new', status: APP_STATUS.APPLIED },
      { listingId: 'new', status: APP_STATUS.WITHDRAWN },
    ],
  }
  const listings = [
    { id: 'old', postedAt: '2026-01-01T00:00:00.000Z', deadline: '2026-02-01T00:00:00.000Z' },
    { id: 'new', postedAt: '2026-03-01T00:00:00.000Z', deadline: '2026-04-01T00:00:00.000Z' },
  ]
  assert.deepEqual(sortPostings(listings, 'newest', db).map((l) => l.id), ['new', 'old'])
  assert.deepEqual(sortPostings(listings, 'deadline', db).map((l) => l.id), ['old', 'new'])
  assert.deepEqual(sortPostings(listings, 'applicants', db).map((l) => l.id), ['new', 'old'])
})

test('countByStatus counts every application status and ignores unknown values', () => {
  const counts = countByStatus([
    { status: APP_STATUS.APPLIED },
    { status: APP_STATUS.APPLIED },
    { status: APP_STATUS.SHORT_LISTED },
    { status: 'Unknown' },
  ])
  assert.equal(counts[APP_STATUS.APPLIED], 2)
  assert.equal(counts[APP_STATUS.SHORT_LISTED], 1)
  assert.equal(counts[APP_STATUS.REJECTED], 0)
})
