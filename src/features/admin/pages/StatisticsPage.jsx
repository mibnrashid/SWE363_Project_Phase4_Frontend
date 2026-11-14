/*
  Admin - Platform statistics (screen 24, FR-AD6)
  Counts for a range (7 days / 30 days / all time), applications by status and a sign-ups chart.
*/
import { useMemo, useState } from 'react'
import { Briefcase, Building2, Clock, GraduationCap, Send } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, PageHeader, StatCard, Tabs } from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { ACCOUNT_STATUS, APP_STATUS_LIST, POSTING_STATUS, ROLES } from '../../../lib/constants'

const DAY = 24 * 60 * 60 * 1000
const RANGES = [
  { value: '7', label: '7 days', days: 7 },
  { value: '30', label: '30 days', days: 30 },
  { value: 'all', label: 'All time', days: null },
]

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const shortDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// one point per day (7 / 30 days) or per week (all time), counting new student and company accounts
function signupSeries(accounts, range) {
  const today = startOfDay(new Date())
  const dates = accounts.map((a) => new Date(a.createdAt)).filter((d) => !Number.isNaN(d.getTime()))
  const step = range.days ? DAY : 7 * DAY
  const first = range.days
    ? new Date(today.getTime() - (range.days - 1) * DAY)
    : startOfDay(dates.length ? Math.min(...dates) : today)

  const buckets = []
  for (let t = first.getTime(); t <= today.getTime(); t += step) {
    buckets.push({ start: t, end: t + step, date: shortDate(new Date(t)), Students: 0, Companies: 0 })
  }
  if (buckets.length === 0) buckets.push({ start: today.getTime(), end: today.getTime() + DAY, date: shortDate(today), Students: 0, Companies: 0 })

  for (const a of accounts) {
    const t = new Date(a.createdAt).getTime()
    const bucket = buckets.find((b) => t >= b.start && t < b.end)
    if (!bucket) continue
    if (a.role === ROLES.STUDENT) bucket.Students += 1
    else if (a.role === ROLES.COMPANY) bucket.Companies += 1
  }
  return buckets.map(({ date, Students, Companies }) => ({ date, Students, Companies }))
}

function StatusBars({ counts, total }) {
  const max = Math.max(1, ...counts.map((c) => c.value))
  return (
    <ul className="space-y-3">
      {counts.map(({ status, value }) => (
        <li key={status} className="grid grid-cols-[92px_1fr_40px] items-center gap-3 text-xs">
          <span className="text-body">{status}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-[#efefec]">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
          </span>
          <span className="text-right font-semibold text-ink">{value}</span>
        </li>
      ))}
      {total === 0 && <li className="pt-1 text-xs text-muted">No applications in this range.</li>}
    </ul>
  )
}

export default function StatisticsPage() {
  useDocumentTitle('Platform statistics')
  const { db } = useStore()
  const [rangeKey, setRangeKey] = useState('30')
  const range = RANGES.find((r) => r.value === rangeKey)

  const stats = useMemo(() => {
    const since = range.days ? startOfDay(new Date()).getTime() - (range.days - 1) * DAY : -Infinity
    const inRange = (iso) => iso && new Date(iso).getTime() >= since
    const accounts = db.accounts.filter((a) => a.role !== ROLES.ADMIN)
    const companies = accounts.filter((a) => a.role === ROLES.COMPANY)
    const applications = db.applications.filter((a) => inRange(a.appliedAt))

    return {
      students: accounts.filter((a) => a.role === ROLES.STUDENT && inRange(a.createdAt)).length,
      verified: companies.filter((a) => a.status === ACCOUNT_STATUS.ACTIVE).length,
      pending: companies.filter((a) => a.status === ACCOUNT_STATUS.PENDING).length,
      activePostings: db.listings.filter((l) => l.status === POSTING_STATUS.OPEN).length,
      newPostings: db.listings.filter((l) => inRange(l.postedAt)).length,
      applications: applications.length,
      byStatus: APP_STATUS_LIST.map((status) => ({ status, value: applications.filter((a) => a.status === status).length })),
      series: signupSeries(
        accounts.filter((a) => inRange(a.createdAt)),
        range,
      ),
    }
  }, [db, range])

  const inLabel = range.days ? `in the last ${range.days} days` : 'all time'

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Platform statistics"
        subtitle="Monitor activity and growth across InternConnect."
        actions={
          <Tabs
            variant="segmented"
            className="w-full sm:w-72"
            value={rangeKey}
            onChange={setRangeKey}
            options={RANGES.map(({ value, label }) => ({ value, label }))}
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} value={stats.students} label="Student accounts" note={`New ${inLabel}`} />
        <StatCard icon={Building2} value={stats.verified} label="Verified companies" note={`${stats.pending} pending requests`} />
        <StatCard icon={Briefcase} value={stats.activePostings} label="Active postings" note={`${stats.newPostings} posted ${inLabel}`} />
        <StatCard icon={Send} value={stats.applications} label="Applications sent" note={`Sent ${inLabel}`} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Clock className="size-3.5" /> {stats.pending} company request{stats.pending === 1 ? '' : 's'} waiting for review
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card
          title="Applications by status"
          subtitle={`Applications sent ${inLabel}`}
          action={<span className="text-xs text-muted">{stats.applications} total</span>}
        >
          <StatusBars counts={stats.byStatus} total={stats.applications} />
        </Card>

        <Card title="New sign-ups" subtitle={`Students and companies ${range.days ? 'per day' : 'per week'}`}>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.series} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e5e5e1" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6f7774' }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6f7774' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e5e5e1' }} />
                <Legend verticalAlign="top" align="right" iconType="plainline" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
                <Line type="monotone" dataKey="Students" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Companies" stroke="#8a918e" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
