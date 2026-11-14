/*
  Table assistant chat (FR-C7 steps 3-5, FR-AI3, FR-AI5).
  Saved in the `assistantChats` collection: one row per posting { id: listingId, listingId, messages }.
  Every assistant answer lists what changed, with an Undo button per change.
*/
import { useEffect, useRef, useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { Alert, Button, Input, Spinner } from '../../../components/ui'
import { useStore } from '../../../store/useStore'
import { useToast } from '../../../context/toastContext'
import { useAiStatus } from '../../../hooks/useAiStatus'
import { RULES } from '../../../lib/constants'
import { makeId } from '../../../lib/ids'
import { cn } from '../../../lib/cn'
import { applyActions, runAssistant, undoChange } from './assistant'

const HOUR = 60 * 60 * 1000
const TYPING_MS = 1000

const EXAMPLES = [
  'Make a table of the 5 strongest for an AI engineer role',
  'Add everyone with GPA above 3.5 to Strong ML background',
  'Why is Reem in Strong ML background?',
]

// add a message to the posting's chat (creates the chat row the first time)
function withMessage(db, listingId, message) {
  const chats = db.assistantChats ?? []
  const exists = chats.some((c) => c.id === listingId)
  return {
    ...db,
    assistantChats: exists
      ? chats.map((c) => (c.id === listingId ? { ...c, messages: [...c.messages, message] } : c))
      : [{ id: listingId, listingId, messages: [message] }, ...chats],
  }
}

function markUndone(db, listingId, messageId, changeId) {
  return {
    ...db,
    assistantChats: (db.assistantChats ?? []).map((c) =>
      c.id !== listingId
        ? c
        : {
            ...c,
            messages: c.messages.map((m) =>
              m.id !== messageId
                ? m
                : { ...m, changes: m.changes.map((ch) => (ch.id === changeId ? { ...ch, undone: true } : ch)) },
            ),
          },
    ),
  }
}

function AssistantMessage({ message, onUndo }) {
  return (
    <div className="max-w-[min(100%,520px)] rounded-xl border border-line bg-white p-4 text-[13px]">
      <p className="leading-relaxed font-semibold whitespace-pre-line text-ink">{message.text}</p>
      {message.changes?.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {message.changes.map((change) => (
            <li key={change.id} className="flex items-center gap-2 text-xs">
              <Check className={cn('size-3.5 shrink-0', change.undone ? 'text-muted' : 'text-primary')} />
              <span className={cn('flex-1', change.undone ? 'text-muted line-through' : 'text-body')}>{change.label}</span>
              {change.undone ? (
                <span className="text-[11px] text-muted">Undone</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onUndo(message.id, change)}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Undo
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AssistantChat({ listing, applications, tables }) {
  const { db, transaction } = useStore()
  const toast = useToast()
  const { aiAvailable } = useAiStatus()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef(null)
  const timer = useRef(null)
  const latest = useRef({ applications, tables })

  const messages = (db.assistantChats ?? []).find((c) => c.id === listing.id)?.messages ?? []

  useEffect(() => {
    latest.current = { applications, tables }
  }, [applications, tables])

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages.length, typing])

  const send = (e) => {
    e.preventDefault()
    const message = text.trim()
    if (!aiAvailable || typing) return
    if (message.length < RULES.CHAT_MIN || message.length > RULES.CHAT_MAX) {
      setError(`Messages must be between ${RULES.CHAT_MIN} and ${RULES.CHAT_MAX} characters.`)
      return
    }
    const lastHour = messages.filter((m) => m.from === 'company' && Date.now() - new Date(m.at).getTime() < HOUR)
    if (lastHour.length >= RULES.CHAT_PER_HOUR) {
      setError('Please wait a few minutes before sending another message.')
      return
    }

    transaction((cur) => withMessage(cur, listing.id, { id: makeId('msg'), from: 'company', text: message, at: new Date().toISOString() }))
    setText('')
    setError('')
    setTyping(true)

    timer.current = setTimeout(() => {
      const { reply, actions } = runAssistant(message, { listing, ...latest.current })
      const replyId = makeId('msg')
      transaction((cur) => {
        const { db: next, changes } = applyActions(cur, actions)
        return withMessage(next, listing.id, { id: replyId, from: 'assistant', text: reply, at: new Date().toISOString(), changes })
      })
      setTyping(false)
    }, TYPING_MS)
  }

  const undo = (messageId, change) => {
    const check = undoChange(db, change.undo)
    if (!check) {
      toast.error("This change can't be undone because its table was deleted.")
      return
    }
    transaction((cur) => markUndone(undoChange(cur, change.undo) ?? cur, listing.id, messageId, change.id))
    toast.success('Change undone.')
  }

  return (
    <section className="rounded-xl border border-line bg-white">
      <header className="flex items-center gap-3 border-b border-line p-4 sm:p-5">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Table assistant</h2>
          <p className="text-[11px] text-muted">Ask for help organizing applicants. You stay in control.</p>
        </div>
      </header>

      <div ref={listRef} className="max-h-[420px] space-y-3 overflow-y-auto bg-canvas/70 p-4 sm:p-5">
        {!aiAvailable && (
          <Alert tone="warning" icon={ShieldCheck}>
            The assistant is unavailable right now. You can still create tables and drag applicants by hand.
          </Alert>
        )}

        {aiAvailable && messages.length === 0 && !typing && (
          <div className="text-xs text-muted">
            <p>Try asking:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setText(ex)}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-xs text-body hover:border-primary hover:text-primary"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.from === 'company' ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[80%] rounded-lg bg-night px-3 py-2 text-xs leading-relaxed text-white">{m.text}</p>
            </div>
          ) : (
            <AssistantMessage key={m.id} message={m} onUndo={undo} />
          ),
        )}

        {typing && <Spinner label="The assistant is thinking..." />}
      </div>

      <form onSubmit={send} className="flex items-start gap-3 border-t border-line p-4" noValidate>
        <Input
          className="flex-1"
          aria-label="Message the table assistant"
          placeholder="Make a table of the 5 strongest for an AI engineer role"
          value={text}
          disabled={!aiAvailable}
          onChange={(e) => {
            setText(e.target.value)
            setError('')
          }}
          error={error}
          hint={aiAvailable ? `${text.trim().length}/${RULES.CHAT_MAX}` : undefined}
        />
        <Button type="submit" size="lg" disabled={!aiAvailable || typing}>
          Send
        </Button>
      </form>
    </section>
  )
}
