import { useState } from 'react'
import { Modal } from '../../../components/ui'

// "I agree to the Terms of Service and Privacy Policy." with both links opening a short modal
export default function TermsLabel() {
  const [doc, setDoc] = useState(null)

  const open = (name) => (e) => {
    e.preventDefault()
    setDoc(name)
  }

  return (
    <>
      I agree to the{' '}
      <a href="#terms" onClick={open('Terms of Service')} className="text-primary underline underline-offset-2">
        Terms of Service
      </a>{' '}
      and{' '}
      <a href="#privacy" onClick={open('Privacy Policy')} className="text-primary underline underline-offset-2">
        Privacy Policy
      </a>
      .
      <Modal open={Boolean(doc)} onClose={() => setDoc(null)} title={doc} size="md">
        <div className="space-y-3 text-sm leading-relaxed text-body">
          <p>InternConnect is a student project (SWE 363, Team 14). This front-end prototype stores demo data only in your browser.</p>
          <p>
            In the full system, resumes are visible only to their owner, the companies the student applied to, and admins. Resumes are
            deleted when the account is deleted.
          </p>
          <p>Names, gender, photos, nationality, email and phone numbers are never sent to the AI service.</p>
        </div>
      </Modal>
    </>
  )
}
