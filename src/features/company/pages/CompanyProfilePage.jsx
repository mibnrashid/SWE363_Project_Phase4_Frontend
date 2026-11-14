/*
  Company profile (screen 18, FR-C1)
  Logo, public profile fields, read-only legal fields and contact details.
*/
import { useState } from 'react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { CITIES, INDUSTRIES, RULES } from '../../../lib/constants'
import { isValid, required, validatePhone, validateUrl } from '../../../lib/validation'
import { Avatar, Button, Card, FileUpload, Input, PageHeader, Select, Textarea } from '../../../components/ui'

function formFromProfile(profile) {
  return {
    industry: profile.industry ?? '',
    city: profile.city ?? '',
    size: profile.size ?? '',
    website: profile.website ?? '',
    description: profile.description ?? '',
    contactPerson: profile.contactPerson ?? '',
    phone: profile.phone ?? '',
    logo: profile.logo ?? null,
  }
}

export default function CompanyProfilePage() {
  useDocumentTitle('Company profile')
  const { update } = useStore()
  const { user, profile } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState(() => formFromProfile(profile))
  const [errors, setErrors] = useState({})

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const save = () => {
    const found = {
      contactPerson: required(form.contactPerson, 'Contact person is required.'),
      phone: validatePhone(form.phone),
      website: validateUrl(form.website),
    }
    setErrors(found)
    if (!isValid(found)) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    update('companies', profile.id, {
      industry: form.industry,
      city: form.city,
      size: form.size.trim(),
      website: form.website.trim(),
      description: form.description.trim(),
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      logo: form.logo,
    })
    toast.success('Profile saved.')
  }

  const email = profile?.email ?? user.email

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Company workspace"
        title="Company profile"
        subtitle="This is what students see on your listings."
        actions={<Button onClick={save}>Save changes</Button>}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-line bg-white p-5 text-center lg:sticky lg:top-24">
          <Avatar src={form.logo} name={profile.name} size="lg" className="mx-auto size-20 rounded-2xl text-lg" />
          <h2 className="mt-3 text-xl font-bold">{profile.name}</h2>
          <p className="mt-0.5 text-[11px] text-muted">Verified company</p>

          <div className="mt-4">
            <FileUpload
              accept={['image/png', 'image/jpeg']}
              maxSizeMB={RULES.LOGO_MAX_MB}
              typeError="Logo must be a PNG or JPG under 2 MB."
              label={form.logo ? 'Replace logo' : 'Upload logo'}
              helper="PNG or JPG, up to 2 MB"
              currentFileName={form.logo ? 'Current logo' : undefined}
              onFile={(file, dataUrl) => {
                setValue('logo', dataUrl)
                toast.success('Logo uploaded.')
              }}
              onError={(message) => toast.error(message)}
            />
            {form.logo && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 text-danger"
                onClick={() => {
                  setValue('logo', null)
                  toast.info('Logo removed.')
                }}
              >
                Remove logo
              </Button>
            )}
          </div>

          <p className="mt-4 border-t border-line pt-3 text-[11px] text-muted">Your profile is visible on all active postings.</p>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Legal information" subtitle="Verified fields cannot be edited.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Company name" value={profile.name} disabled hint="Only an admin can change this." />
              <Input label="CR number" value={profile.crNumber} disabled hint="Only an admin can change this." />
            </div>
          </Card>

          <Card title="Public profile" subtitle="This information helps students understand your company.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Industry" options={INDUSTRIES} placeholder="Select industry" value={form.industry} onChange={set('industry')} />
              <Select label="City" options={CITIES} placeholder="Select city" value={form.city} onChange={set('city')} />
              <Input label="Company size" placeholder="e.g. 500+ employees" value={form.size} onChange={set('size')} />
              <Input
                label="Website"
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={set('website')}
                error={errors.website}
              />
              <Textarea
                className="sm:col-span-2"
                label="Description"
                rows={4}
                maxLength={600}
                placeholder="Tell students what your company does and what it is like to work there."
                value={form.description}
                onChange={set('description')}
              />
            </div>
          </Card>

          <Card title="Contact details" subtitle="Used for account and applicant communications.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Contact name"
                required
                value={form.contactPerson}
                onChange={set('contactPerson')}
                error={errors.contactPerson}
              />
              <Input label="Official email" type="email" value={email} disabled hint="Your login email can't be changed here." />
              <Input
                label="Phone"
                type="tel"
                required
                placeholder="+966 5x xxx xxxx"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
