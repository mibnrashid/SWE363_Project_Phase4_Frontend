/*
  Admin - Users (screen 20, FR-AD2)
  Search students and companies, suspend (archives their content) or reactivate (restores it).
*/
import { useState } from 'react'
import { ChevronRight, Search, Users } from 'lucide-react'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
} from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { addAuditLog } from '../../../store/actions'
import { getCompany, getStudent } from '../../../store/selectors'
import { ACCOUNT_STATUS, POSTING_STATUS, ROLES } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import DetailList from '../components/DetailList'
import { matchesText, patchRow } from '../adminUtils'

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: 'Student' },
  { value: ROLES.COMPANY, label: 'Company' },
]

const STATUS_OPTIONS = [
  { value: ACCOUNT_STATUS.ACTIVE, label: 'Active' },
  { value: ACCOUNT_STATUS.SUSPENDED, label: 'Suspended' },
  { value: ACCOUNT_STATUS.PENDING, label: 'Pending' },
  { value: ACCOUNT_STATUS.REJECTED, label: 'Rejected' },
  { value: ACCOUNT_STATUS.UNVERIFIED, label: 'Unverified' },
]

const statusTone = { active: 'success', suspended: 'danger' }
const statusLabel = (s) => STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
const roleLabel = (r) => ROLE_OPTIONS.find((o) => o.value === r)?.label ?? r

function AccountStatusBadge({ status }) {
  return <Badge tone={statusTone[status] ?? 'neutral'}>{statusLabel(status)}</Badge>
}

// suspend: company -> its open/closed listings are removed; student -> applications archived
function suspendAccount(db, account, reason) {
  let next = patchRow(db, 'accounts', account.id, { status: ACCOUNT_STATUS.SUSPENDED, suspendReason: reason })
  if (account.role === ROLES.COMPANY) {
    next = {
      ...next,
      listings: next.listings.map((l) =>
        l.companyId === account.id && (l.status === POSTING_STATUS.OPEN || l.status === POSTING_STATUS.CLOSED)
          ? { ...l, status: POSTING_STATUS.REMOVED, removedReason: 'Account suspended', suspendedFrom: l.status }
          : l,
      ),
    }
  } else {
    next = {
      ...next,
      applications: next.applications.map((a) => (a.studentId === account.id ? { ...a, archived: true } : a)),
    }
  }
  return next
}

// reactivate: put back what the suspension archived
function reactivateAccount(db, account) {
  let next = patchRow(db, 'accounts', account.id, { status: ACCOUNT_STATUS.ACTIVE, suspendReason: '' })
  if (account.role === ROLES.COMPANY) {
    next = {
      ...next,
      listings: next.listings.map((l) => {
        if (l.companyId !== account.id || !l.suspendedFrom) return l
        const { suspendedFrom, ...rest } = l
        return { ...rest, status: suspendedFrom, removedReason: '' }
      }),
    }
  } else {
    next = {
      ...next,
      applications: next.applications.map((a) => (a.studentId === account.id ? { ...a, archived: false } : a)),
    }
  }
  return next
}

function UserDrawer({ account, db, isSelf, onClose, onSuspend, onReactivate }) {
  const student = account.role === ROLES.STUDENT ? getStudent(db, account.id) : null
  const company = account.role === ROLES.COMPANY ? getCompany(db, account.id) : null
  const suspended = account.status === ACCOUNT_STATUS.SUSPENDED

  const rows = student
    ? [
        ['Email', account.email],
        ['University', student.university],
        ['Major', student.major],
        ['Phone', student.phone],
        ['Joined', formatDate(account.createdAt)],
        ['Applications', db.applications.filter((a) => a.studentId === account.id).length],
      ]
    : [
        ['Email', account.email],
        ['Industry', company?.industry],
        ['City', company?.city],
        ['CR number', company?.crNumber],
        ['Joined', formatDate(account.createdAt)],
        ['Postings', db.listings.filter((l) => l.companyId === account.id).length],
      ]

  return (
    <Drawer
      open
      onClose={onClose}
      footer={
        isSelf ? null : suspended ? (
          <Button className="flex-1" onClick={onReactivate}>
            Reactivate
          </Button>
        ) : (
          <Button className="flex-1" variant="danger" onClick={onSuspend}>
            Suspend
          </Button>
        )
      }
    >
      <Avatar name={account.name} src={company?.logo} round={!company} size="lg" />
      <h2 className="mt-4 text-2xl font-bold">{account.name}</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge>{roleLabel(account.role)}</Badge>
        <AccountStatusBadge status={account.status} />
      </div>

      {suspended && account.suspendReason && (
        <Alert tone="danger" title="Suspended" className="mt-4">
          {account.suspendReason}
        </Alert>
      )}

      <div className="mt-5 border-t border-line pt-5">
        <h3 className="text-lg font-bold">Details and activity</h3>
        <DetailList rows={rows} />
      </div>

      {!isSelf && (
        <p className="mt-4 text-xs text-muted">
          {account.role === ROLES.COMPANY
            ? "Suspending a company logs it out and removes its open and closed postings. Reactivating restores them."
            : 'Suspending a student logs them out and archives their applications. Reactivating restores them.'}
        </p>
      )}
    </Drawer>
  )
}

export default function UsersPage() {
  useDocumentTitle('Users')
  const { db, transaction } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [suspending, setSuspending] = useState(false)

  const accounts = db.accounts
    .filter((a) => a.role !== ROLES.ADMIN)
    .filter((a) => (!role || a.role === role) && (!status || a.status === status))
    .filter((a) => matchesText(query, a.name, a.email))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const selected = db.accounts.find((a) => a.id === selectedId) ?? null

  const suspend = (reason) => {
    transaction((cur) =>
      addAuditLog(suspendAccount(cur, selected, reason), {
        action: 'Account suspended',
        by: user?.name ?? 'Admin',
        details: `${selected.name} (${roleLabel(selected.role)}) - ${reason}`,
      }),
    )
    setSuspending(false)
    toast.success(`${selected.name} was suspended.`)
  }

  const reactivate = () => {
    transaction((cur) =>
      addAuditLog(reactivateAccount(cur, selected), {
        action: 'Account reactivated',
        by: user?.name ?? 'Admin',
        details: `${selected.name} (${roleLabel(selected.role)})`,
      }),
    )
    toast.success(`${selected.name} was reactivated.`)
  }

  return (
    <>
      <PageHeader eyebrow="Admin console" title="Users" subtitle="Manage student and company access." />

      <div className="mb-4 grid gap-3 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_180px_180px]">
        <Input
          icon={Search}
          aria-label="Search name or email"
          placeholder="Search name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} placeholder="All roles" />
        <Select
          aria-label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
        />
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState icon={Users} title="No users found" message="Try a different search or filter." />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>
                <span className="sr-only">Open</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} onClick={() => setSelectedId(a.id)} className="cursor-pointer hover:bg-canvas/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} round size="sm" />
                    <button
                      type="button"
                      className="text-left text-[13px] font-semibold text-ink hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(a.id)
                      }}
                    >
                      {a.name}
                    </button>
                  </div>
                </Td>
                <Td className="text-[13px]">{roleLabel(a.role)}</Td>
                <Td className="text-[13px]">{a.email}</Td>
                <Td>
                  <AccountStatusBadge status={a.status} />
                </Td>
                <Td className="text-[13px] whitespace-nowrap">{formatDate(a.createdAt)}</Td>
                <Td className="w-10 text-muted">
                  <ChevronRight className="size-4" />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {selected && (
        <UserDrawer
          key={selected.id}
          account={selected}
          db={db}
          isSelf={selected.id === user?.id}
          onClose={() => setSelectedId(null)}
          onSuspend={() => setSuspending(true)}
          onReactivate={reactivate}
        />
      )}

      <ConfirmDialog
        open={suspending}
        title={`Suspend ${selected?.name ?? 'this user'}?`}
        message="They will be logged out and won't be able to log in. Their content is archived until you reactivate them."
        confirmLabel="Suspend"
        danger
        requireReason
        reasonPlaceholder="Explain why this account is suspended."
        onCancel={() => setSuspending(false)}
        onConfirm={suspend}
      />
    </>
  )
}
