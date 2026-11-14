import { useEffect } from 'react'

// Sets the browser tab title: useDocumentTitle('My applications') -> "My applications | InternConnect"
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | InternConnect` : 'InternConnect'
  }, [title])
}
