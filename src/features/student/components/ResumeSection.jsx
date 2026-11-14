/*
  Resume upload on the profile page (FR-S1, simulated FR-AI1).
  Upload -> 'pending' -> after ~2.5 s 'analysed' (or 'unreadable' when the file name contains "scan").
  While the AI is down the resume stays 'pending' and is analysed as soon as the service is back.
*/
import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, FileText, Upload } from 'lucide-react'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { useAiStatus } from '../../../hooks/useAiStatus'
import { RULES } from '../../../lib/constants'
import { formatDate } from '../../../lib/format'
import { Alert, Button, FileUpload, Spinner } from '../../../components/ui'

const ANALYSIS_MS = 2500

export default function ResumeSection({ profile }) {
  const { update } = useStore()
  const toast = useToast()
  const { aiAvailable } = useAiStatus()
  const [replacing, setReplacing] = useState(false)
  const resume = profile.resume

  // finish the (fake) analysis of a pending resume when the AI is available
  const pending = resume?.status === 'pending'
  const fileName = resume?.fileName
  const uploadedAt = resume?.uploadedAt
  useEffect(() => {
    if (!pending || !aiAvailable) return
    const timer = setTimeout(() => {
      const unreadable = /scan/i.test(fileName ?? '')
      update('students', profile.id, (row) =>
        row.resume?.uploadedAt === uploadedAt ? { resume: { ...row.resume, status: unreadable ? 'unreadable' : 'analysed' } } : {},
      )
      if (unreadable) toast.error("We couldn't read your resume. Try a text-based PDF.")
      else toast.success('Resume analysed. Your recommendations were refreshed.')
    }, ANALYSIS_MS)
    return () => clearTimeout(timer)
  }, [pending, aiAvailable, fileName, uploadedAt, profile.id, update, toast])

  const onFile = (file, dataUrl) => {
    update('students', profile.id, {
      resume: { fileName: file.name, dataUrl, uploadedAt: new Date().toISOString(), status: 'pending' },
    })
    setReplacing(false)
    toast.success(aiAvailable ? 'Resume uploaded. Analysing it now.' : 'Resume uploaded. Analysis is pending.')
  }

  const upload = (
    <FileUpload
      accept={['application/pdf']}
      maxSizeMB={RULES.RESUME_MAX_MB}
      typeError="Please upload a PDF under 5 MB."
      helper={`PDF only, up to ${RULES.RESUME_MAX_MB} MB`}
      onFile={onFile}
      onError={(message) => toast.error(message)}
    />
  )

  if (!resume) return upload

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary-soft/40 p-4 sm:flex-row sm:items-center">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{resume.fileName}</p>
          <p className="mt-0.5 text-[11px] text-muted">PDF · Uploaded {formatDate(resume.uploadedAt)}</p>
          <div className="mt-1.5 text-xs">
            {resume.status === 'analysed' && (
              <span className="flex items-center gap-1.5 font-semibold text-primary">
                <CheckCircle2 className="size-3.5" /> Resume analysed
              </span>
            )}
            {resume.status === 'pending' &&
              (aiAvailable ? (
                <Spinner label="Analysis pending" className="text-xs" />
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-warning">
                  <Clock className="size-3.5" /> Analysis pending - we&apos;ll analyse it when the service is back.
                </span>
              ))}
            {resume.status === 'unreadable' && <span className="font-medium text-danger">Couldn&apos;t read this file</span>}
          </div>
        </div>
        <Button variant="secondary" icon={Upload} onClick={() => setReplacing((r) => !r)} className="sm:shrink-0">
          {replacing ? 'Cancel' : 'Replace file'}
        </Button>
      </div>

      {resume.status === 'unreadable' && (
        <Alert tone="danger" title="We couldn't read your resume. Try a text-based PDF.">
          Scanned files can't be analysed. Export your resume as a PDF from a text editor and upload it again.
        </Alert>
      )}

      {replacing && upload}
    </div>
  )
}
