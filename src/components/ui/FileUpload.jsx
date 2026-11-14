import { useRef, useState } from 'react'
import { FileText, UploadCloud } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * Click-or-drop file picker that validates type and size before calling onFile.
 *
 * Resume (FR-S1):  <FileUpload accept={['application/pdf']} maxSizeMB={5}
 *                    typeError="Please upload a PDF under 5 MB." onFile={handleFile} />
 * Logo (FR-C1):    <FileUpload accept={['image/png', 'image/jpeg']} maxSizeMB={2} ... />
 *
 * onFile(file, dataUrl) is called only when the file is valid.
 * dataUrl is a base64 string you can store in the data store and show later.
 * Errors are shown inside the component (and also passed to onError if given).
 */
export default function FileUpload({
  accept = [],
  maxSizeMB = 5,
  label = 'Click to upload or drag and drop',
  helper,
  typeError,
  currentFileName,
  onFile,
  onError,
  className,
}) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const fail = (message) => {
    setError(message)
    onError?.(message)
  }

  const handle = (file) => {
    if (!file) return
    const tooBig = file.size > maxSizeMB * 1024 * 1024
    const wrongType = accept.length > 0 && !accept.includes(file.type)
    if (wrongType || tooBig) {
      fail(typeError ?? `File must be ${accept.join(' or ')} and under ${maxSizeMB} MB.`)
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => onFile?.(file, reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handle(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
          error ? 'border-danger/50 bg-danger-soft/50' : dragging ? 'border-primary bg-primary-soft' : 'border-line bg-canvas hover:border-primary/50',
        )}
      >
        {currentFileName ? <FileText className="size-6 text-primary" /> : <UploadCloud className="size-6 text-muted" />}
        <span className="text-sm font-medium text-ink">{currentFileName ?? label}</span>
        {helper && <span className="text-xs text-muted">{helper}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {error && (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
