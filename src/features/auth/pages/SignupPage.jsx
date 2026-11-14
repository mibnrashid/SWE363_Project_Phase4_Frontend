/*
  Screen 3 - Sign up, student or company (FR-A1, FR-A2)
  States: field errors, email already taken, CR taken, "check your email", company request sent.
*/
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, CheckCircle2, Lock, Mail, Phone, UserRound } from 'lucide-react'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { CITIES, INDUSTRIES, MAJORS, UNIVERSITIES } from '../../../lib/constants'
import {
  isValid,
  required,
  validateConfirm,
  validateCR,
  validateEmail,
  validatePassword,
  validatePhone,
} from '../../../lib/validation'
import { Button, Checkbox, Input, Select, Tabs } from '../../../components/ui'
import { HOME_BY_ROLE, PATHS } from '../../../routes/paths'
import AuthHeading from '../components/AuthHeading'
import TermsLabel from '../components/TermsLabel'

const EMPTY_STUDENT = { name: '', university: '', email: '', major: '', password: '', confirm: '', terms: false }
const EMPTY_COMPANY = {
  companyName: '',
  contactPerson: '',
  email: '',
  crNumber: '',
  industry: '',
  city: '',
  phone: '',
  password: '',
  confirm: '',
  terms: false,
}

function validateStudent(f) {
  return {
    name: required(f.name, 'Full name is required.'),
    university: required(f.university, 'Select your university.'),
    email: validateEmail(f.email),
    major: required(f.major, 'Select your major.'),
    password: validatePassword(f.password),
    confirm: validateConfirm(f.password, f.confirm),
    terms: f.terms ? '' : 'You need to accept the terms to continue.',
  }
}

function validateCompany(f) {
  return {
    companyName: required(f.companyName, 'Company name is required.'),
    contactPerson: required(f.contactPerson, 'Contact person is required.'),
    email: validateEmail(f.email),
    crNumber: validateCR(f.crNumber),
    industry: required(f.industry, 'Select an industry.'),
    city: required(f.city, 'Select a city.'),
    phone: validatePhone(f.phone),
    password: validatePassword(f.password),
    confirm: validateConfirm(f.password, f.confirm),
    terms: f.terms ? '' : 'You need to accept the terms to continue.',
  }
}

export default function SignupPage() {
  useDocumentTitle('Create your account')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, registerStudent, registerCompany } = useAuth()

  const [tab, setTab] = useState(params.get('role') === 'company' ? 'company' : 'student')
  const [student, setStudent] = useState(EMPTY_STUDENT)
  const [company, setCompany] = useState(EMPTY_COMPANY)
  const [errors, setErrors] = useState({})
  const [companySent, setCompanySent] = useState(null)
  const next = params.get('next')

  if (user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />

  const form = tab === 'student' ? student : company
  const setForm = tab === 'student' ? setStudent : setCompany

  // update one field and clear its error
  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      if (errors[key]) setErrors((er) => ({ ...er, [key]: '' }))
    },
  })

  const switchTab = (value) => {
    setTab(value)
    setErrors({})
  }

  const submit = (e) => {
    e.preventDefault()
    const found = tab === 'student' ? validateStudent(student) : validateCompany(company)
    if (!isValid(found)) {
      setErrors(found)
      toast.error('Please fix the highlighted fields.')
      return
    }

    if (tab === 'student') {
      const result = registerStudent(student)
      if (!result.ok) {
        setErrors({ [result.field]: result.message })
        return
      }
      const query = next ? `?next=${encodeURIComponent(next)}` : ''
      navigate(`${PATHS.checkEmail(result.account.id)}${query}`)
    } else {
      const result = registerCompany(company)
      if (!result.ok) {
        setErrors({ [result.field]: result.message })
        return
      }
      setCompanySent(result.account)
    }
  }

  // FR-A2 system response
  if (companySent) {
    return (
      <div className="rounded-xl border border-line bg-white p-6 text-center sm:p-10">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <CheckCircle2 className="size-6" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">Your request was sent</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-body">
          We&apos;ll email <span className="font-semibold text-ink">{companySent.email}</span> once an admin reviews it. This usually takes
          up to 2 business days.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button to={PATHS.login}>Log in to check status</Button>
          <Button variant="secondary" to={PATHS.home}>
            Back to opportunities
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <AuthHeading title="Create your account" subtitle="Join students and companies across Saudi Arabia." />

      <Tabs
        variant="segmented"
        value={tab}
        onChange={switchTab}
        options={[
          { value: 'student', label: 'Student', icon: UserRound },
          { value: 'company', label: 'Company', icon: Building2 },
        ]}
      />

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        {tab === 'student' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" placeholder="e.g. Nora Alqahtani" autoComplete="name" {...field('name')} />
              <Select label="University" placeholder="Select your university" options={UNIVERSITIES} {...field('university')} />
            </div>
            <Input label="Email address" type="email" icon={Mail} placeholder="student@university.edu.sa" autoComplete="email" {...field('email')} />
            <Select label="Major" placeholder="Select your major" options={MAJORS} {...field('major')} />
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Company name" placeholder="Registered company name" {...field('companyName')} />
              <Input label="Contact person" placeholder="Full name" {...field('contactPerson')} />
            </div>
            <Input label="Official email address" type="email" icon={Mail} placeholder="hr@company.sa" autoComplete="email" {...field('email')} />
            <Input
              label="Commercial Registration (CR)"
              placeholder="10-digit CR number"
              inputMode="numeric"
              maxLength={10}
              {...field('crNumber')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Industry" placeholder="Select industry" options={INDUSTRIES} {...field('industry')} />
              <Select label="City" placeholder="Select city" options={CITIES} {...field('city')} />
            </div>
            <Input label="Phone" type="tel" icon={Phone} placeholder="+966 5X XXX XXXX" {...field('phone')} />
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            hint="8+ characters with a letter and a number"
            {...field('password')}
          />
          <Input label="Confirm password" type="password" icon={Lock} placeholder="Repeat password" autoComplete="new-password" {...field('confirm')} />
        </div>

        <Checkbox
          checked={form.terms}
          onChange={(e) => {
            setForm((f) => ({ ...f, terms: e.target.checked }))
            setErrors((er) => ({ ...er, terms: '' }))
          }}
          error={errors.terms}
          label={<TermsLabel />}
        />

        <Button type="submit" size="lg" fullWidth className="mt-1">
          {tab === 'student' ? 'Create student account' : 'Create company account'}
        </Button>

        <p className="text-center text-sm text-body">
          Already have an account?{' '}
          <Link to={next ? `${PATHS.login}?next=${encodeURIComponent(next)}` : PATHS.login} className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </>
  )
}
