import { Building2, Globe, Mail, MapPin } from 'lucide-react'
import { Avatar, Modal } from '../../../components/ui'

// "View company profile" on a listing (FR-C1: profile shown to students on every listing)
export default function CompanyProfileModal({ open, onClose, company, openCount }) {
  if (!company) return null
  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex items-center gap-4">
        <Avatar name={company.name} src={company.logo} size="lg" />
        <div>
          <h2 className="text-2xl font-bold">{company.name}</h2>
          <p className="text-sm text-muted">
            {[company.industry, company.size].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      {company.description && <p className="mt-5 text-sm leading-relaxed text-body">{company.description}</p>}
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        {company.city && (
          <div className="flex items-center gap-2 text-body">
            <MapPin className="size-4 text-muted" /> {company.city}
          </div>
        )}
        {company.industry && (
          <div className="flex items-center gap-2 text-body">
            <Building2 className="size-4 text-muted" /> {company.industry}
          </div>
        )}
        {company.website && (
          <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
            <Globe className="size-4" /> Website
          </a>
        )}
        {company.email && (
          <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-primary hover:underline">
            <Mail className="size-4" /> {company.email}
          </a>
        )}
      </dl>
      <p className="mt-5 rounded-lg bg-canvas px-4 py-3 text-xs text-muted">
        {openCount} open {openCount === 1 ? 'opportunity' : 'opportunities'} on InternConnect
      </p>
    </Modal>
  )
}
