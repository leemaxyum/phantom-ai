import { useEffect, useRef, useCallback } from 'react'

export function useAutoScroll(deps: unknown[], enabled = true) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    })
  }, [])

  useEffect(() => {
    if (enabled) scrollToBottom()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { bottomRef, scrollToBottom }
}
