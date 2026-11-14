/*
  Screen 14 - Settings (FR-S10, FR-A5)
  Notifications (in-app status updates is real, the others are visual only), log out,
  account (change password), privacy (NFR-7, NFR-12).
*/
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { isValid, validateConfirm, validatePassword } from '../../../lib/validation'
import { cn } from '../../../lib/cn'
import { PATHS } from '../../../routes/paths'
import { Button, Input, PageHeader, Toggle } from '../../../components/ui'

const MENU = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account', icon: LockKeyhole },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
]

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      <div className="mt-4 border-t border-line">{children}</div>
    </section>
  )
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-4">
      <div>
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-[11px] text-muted">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

function NotificationsPanel() {
  const { update } = useStore()
  const { profile, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState({
    notifyEmail: profile.notifyEmail ?? true,
    notifyStatusUpdates: profile.notifyStatusUpdates !== false,
    weeklyRecommendations: profile.weeklyRecommendations ?? true,
  })
  const set = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }))

  const save = () => {
    update('students', profile.id, prefs)
    toast.success('Preferences saved.')
  }

  const signOut = () => {
    logout()
    navigate(PATHS.home)
    toast.success('You have been logged out.')
  }

  return (
    <Panel title="Notification preferences" subtitle="Choose how InternConnect keeps you informed.">
      <ToggleRow
        title="Email notifications"
        description="Application updates, reminders, and recommendations"
        checked={prefs.notifyEmail}
        onChange={set('notifyEmail')}
      />
      <ToggleRow
        title="In-app status updates"
        description="Status updates and approaching application deadlines"
        checked={prefs.notifyStatusUpdates}
        onChange={set('notifyStatusUpdates')}
      />
      <ToggleRow
        title="Weekly recommendations"
        description="A weekly selection of opportunities matched to your profile"
        checked={prefs.weeklyRecommendations}
        onChange={set('weeklyRecommendations')}
      />
      <Button className="mt-5" onClick={save}>
        Save preferences
      </Button>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/15 bg-danger-soft/60 p-4">
        <div>
          <p className="text-[13px] font-semibold text-ink">Log out of InternConnect</p>
          <p className="mt-0.5 text-[11px] text-muted">You&apos;ll return to the guest landing page.</p>
        </div>
        <Button variant="secondary" onClick={signOut}>
          Log out
        </Button>
      </div>
    </Panel>
  )
}

function AccountPanel() {
  const { update } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const empty = { current: '', next: '', confirm: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = () => {
    const found = {
      current: !form.current ? 'Enter your current password.' : form.current !== user.password ? 'Current password is incorrect.' : '',
      next: validatePassword(form.next) || (form.next && form.next === form.current ? 'Choose a password different from the current one.' : ''),
      confirm: validateConfirm(form.next, form.confirm),
    }
    setErrors(found)
    if (!isValid(found)) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    update('accounts', user.id, { password: form.next })
    setForm(empty)
    toast.success('Password changed.')
  }

  return (
    <Panel title="Account" subtitle="Your login details.">
      <div className="flex flex-col gap-4 pt-5">
        <Input label="Email" value={user.email} disabled hint="Contact support to change your login email." />
        <div className="border-t border-line pt-5">
          <h3 className="text-base font-bold">Change password</h3>
          <div className="mt-3 grid gap-4 sm:max-w-md">
            <Input label="Current password" type="password" autoComplete="current-password" value={form.current} onChange={set('current')} error={errors.current} />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters with a letter and a number."
              value={form.next}
              onChange={set('next')}
              error={errors.next}
            />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
          </div>
          <Button className="mt-5" onClick={save}>
            Update password
          </Button>
        </div>
      </div>
    </Panel>
  )
}

function PrivacyPanel() {
  return (
    <Panel title="Privacy" subtitle="How your information is used.">
      <div className="flex flex-col gap-4 pt-5 text-sm leading-relaxed text-body">
        <div>
          <h3 className="text-base font-bold text-ink">Who can see your resume</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You</li>
            <li>Companies you applied to (only for the postings you applied to)</li>
            <li>InternConnect administrators, when needed to support you</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-bold text-ink">What the AI receives</h3>
          <p className="mt-2">
            Matching and recommendations only use your academic details, skills and resume content. Your name, email, phone number and other
            personal identifiers are never sent to the AI service.
          </p>
        </div>
      </div>
    </Panel>
  )
}

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const [section, setSection] = useState('notifications')

  return (
    <div className="pb-4">
      <PageHeader eyebrow="Student workspace" title="Settings" subtitle="Manage your account and notification preferences." />

      <div className="grid items-start gap-5 lg:grid-cols-[210px_1fr]">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-2 lg:flex-col">
          {MENU.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={section === item.id ? 'page' : undefined}
              onClick={() => setSection(item.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] whitespace-nowrap transition-colors',
                section === item.id ? 'bg-primary-soft font-semibold text-primary' : 'text-body hover:bg-canvas',
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {section === 'notifications' && <NotificationsPanel />}
          {section === 'account' && <AccountPanel />}
          {section === 'privacy' && <PrivacyPanel />}
        </div>
      </div>
    </div>
  )
}
