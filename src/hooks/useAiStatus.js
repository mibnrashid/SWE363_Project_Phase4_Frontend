import { useSyncExternalStore } from 'react'

/*
  Simulates the Gemini service being up or down (FR-AI5, NFR-9) so the
  "AI unavailable" states can be shown in the demo. Toggle it from the footer.

    const { aiAvailable } = useAiStatus()
    if (!aiAvailable) -> show "Showing keyword results only" / "The assistant is unavailable right now..."
*/
const KEY = 'internconnect-ai-down'
const listeners = new Set()

function read() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setAiDown(down) {
  try {
    if (down) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useAiStatus() {
  const aiDown = useSyncExternalStore(subscribe, read, () => false)
  return { aiAvailable: !aiDown, setAiDown }
}
