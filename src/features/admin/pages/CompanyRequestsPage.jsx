/*
  Admin - Company requests (screen 19, FR-AD1)
  Pending company registrations: review in a drawer, approve or reject with a reason.
*/
import { useState } from 'react'
import { Building2, ChevronRight, FileText, ShieldCheck } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Modal,
  PageHeader,
  Table,
  Td,
  Th,
} from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useAuth } from '../../../context/authContext'
import { useToast } from '../../../context/toastContext'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { addAuditLog, addNotification } from '../../../store/actions'
import { getCompany } from '../../../store/selectors'
import { ACCOUNT_STATUS, ROLES } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { PATHS } from '../../../routes/paths'
import StatChip from '../components/StatChip'
import DetailList from '../components/DetailList'
import { isThisMonth, patchRow } from '../adminUtils'

const CHECKS = ['Company name matches CR', 'CR is active and valid', 'Contact email domain verified']

function RequestDrawer({ request, onClose, onApprove, onReject }) {
  const [checks, setChecks] = useState([false, false, false])
  const [docOpen, setDocOpen] = useState(false)
  const { company } = request

  return (
    <Drawer
      open
      onClose={onClose}
      footer={
        <>
          <Button className="flex-1" onClick={onApprove}>
            Approve company
          </Button>
          <Button className="flex-1" variant="danger" onClick={onReject}>
            Reject request
          </Button>
        </>
      }
    >
      <Avatar name={company.name} src={company.logo} size="lg" />
      <h2 className="mt-4 text-2xl font-bold">{company.name}</h2>
      <p className="text-xs text-muted">
        {company.industry} · {company.city}
      </p>
      <Badge tone="warning" className="mt-3">
        Pending review
      </Badge>

      <div className="mt-5 border-t border-line pt-5">
        <h3 className="text-lg font-bold">Registration details</h3>
        <DetailList
          rows={[
            ['CR number', company.crNumber],
            ['Submitted', formatDate(company.submittedAt ?? request.account.createdAt)],
            ['Contact person', company.contactPerson],
            ['Work email', company.email],
            ['Phone', company.phone],
          ]}
        />
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-line p-3">
        <FileText className="size-6 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">Commercial Registration</p>
          <p className="truncate text-[11px] text-muted">CR_{company.crNumber}.pdf</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setDocOpen(true)}>
          View document
        </Button>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <h3 className="text-lg font-bold">Verification checklist</h3>
        <div className="mt-2 space-y-2">
          {CHECKS.map((label, i) => (
            <Checkbox
              key={label}
              label={label}
              checked={checks[i]}
              onChange={(e) => setChecks((cur) => cur.map((v, j) => (j === i ? e.target.checked : v)))}
            />
          ))}
        </div>
      </div>

      <Modal open={docOpen} onClose={() => setDocOpen(false)} title="Commercial Registration" size="sm">
        <p className="text-sm text-body">Document preview is not available in the front-end prototype.</p>
        <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-sm">
          CR number: <span className="font-semibold text-ink">{company.crNumber}</span>
        </p>
      </Modal>
    </Drawer>
  )
}

export default function CompanyRequestsPage() {
  useDocumentTitle('Company requests')
  const { db, transaction } = useStore()
  const { user } = useAuth()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [rejecting, setRejecting] = useState(false)

  const companyAccounts = db.accounts.filter((a) => a.role === ROLES.COMPANY)
  const requests = companyAccounts
    .filter((a) => a.status === ACCOUNT_STATUS.PENDING)
    .map((account) => ({ account, company: getCompany(db, account.id) }))
    .filter((r) => r.company)
    .sort((a, b) => new Date(b.company.submittedAt ?? 0) - new Date(a.company.submittedAt ?? 0))

  const decidedThisMonth = (status) =>
    companyAccounts.filter((a) => a.status === status && isThisMonth(a.reviewedAt ?? a.createdAt)).length

  const selected = requests.find((r) => r.account.id === selectedId) ?? null

  const approve = () => {
    const { company } = selected
    transaction((cur) => {
      let next = patchRow(cur, 'accounts', company.id, {
        status: ACCOUNT_STATUS.ACTIVE,
        rejectReason: '',
        reviewedAt: new Date().toISOString(),
      })
      next = addNotification(next, {
        userId: company.id,
        type: 'system',
        title: 'Your company was approved',
        message: `${company.name} can now post training opportunities on InternConnect.`,
        link: PATHS.company.dashboard,
      })
      return addAuditLog(next, { action: 'Company approved', by: user?.name ?? 'Admin', details: company.name })
    })
    setSelectedId(null)
    toast.success('Company approved.')
  }

  const reject = (reason) => {
    const { company } = selected
    transaction((cur) => {
      let next = patchRow(cur, 'accounts', company.id, {
        status: ACCOUNT_STATUS.REJECTED,
        rejectReason: reason,
        reviewedAt: new Date().toISOString(),
      })
      next = addNotification(next, {
        userId: company.id,
        type: 'system',
        title: 'Your company registration was not approved',
        message: reason,
        link: PATHS.companyPending,
      })
      return addAuditLog(next, { action: 'Company rejected', by: user?.name ?? 'Admin', details: `${company.name} - ${reason}` })
    })
    setRejecting(false)
    setSelectedId(null)
    toast.success('Company request rejected.')
  }

  return (
    <>
      <PageHeader eyebrow="Admin console" title="Company requests" subtitle="Review and verify company registrations." />

      <div className="mb-5 flex flex-wrap gap-3">
        <StatChip value={requests.length} label="Pending review" />
        <StatChip value={decidedThisMonth(ACCOUNT_STATUS.ACTIVE)} label="Approved this month" />
        <StatChip value={decidedThisMonth(ACCOUNT_STATUS.REJECTED)} label="Rejected this month" />
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState icon={Building2} title="No pending requests" message="New company registrations will appear here." />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Company</Th>
              <Th>Industry</Th>
              <Th>City</Th>
              <Th>CR number</Th>
              <Th>Submitted</Th>
              <Th>
                <span className="sr-only">Open</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {requests.map(({ account, company }) => (
              <tr
                key={account.id}
                onClick={() => setSelectedId(account.id)}
                className="cursor-pointer hover:bg-canvas/60"
              >
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={company.name} src={company.logo} />
                    <button
                      type="button"
                      className="text-left text-[13px] font-semibold text-ink hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(account.id)
                      }}
                    >
                      {company.name}
                    </button>
                  </div>
                </Td>
                <Td className="text-[13px]">{company.industry}</Td>
                <Td className="text-[13px]">{company.city}</Td>
                <Td className="text-[13px]">{company.crNumber}</Td>
                <Td className="text-[13px] whitespace-nowrap">{formatDate(company.submittedAt ?? account.createdAt)}</Td>
                <Td className="w-10 text-muted">
                  <ChevronRight className="size-4" />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {selected && (
        <RequestDrawer
          key={selected.account.id}
          request={selected}
          onClose={() => setSelectedId(null)}
          onApprove={approve}
          onReject={() => setRejecting(true)}
        />
      )}

      <ConfirmDialog
        open={rejecting}
        title="Reject company request?"
        message="The reason will be included in the company's rejection notice."
        confirmLabel="Reject request"
        danger
        requireReason
        reasonPlaceholder="Provide a clear reason that will be shared with the user."
        onCancel={() => setRejecting(false)}
        onConfirm={reject}
      >
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <ShieldCheck className="size-3.5 text-primary" /> {selected?.company.name}
        </div>
      </ConfirmDialog>
    </>
  )
}
