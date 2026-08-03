export function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (isToday) return time

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`
}

export function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\s+/g, ' ')
  if (cleaned.length <= 40) return cleaned || 'New conversation'
  return `${cleaned.slice(0, 40)}…`
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function matchSfxFile(files: string[], type: string): string | null {
  const keywords: Record<string, string[]> = {
    click: ['click', 'button'],
    hover: ['hover'],
    send: ['send', 'sent', 'message-send'],
    receive: ['receive', 'received', 'message-receive', 'incoming'],
    toggle: ['toggle', 'switch'],
    modal: ['modal', 'open', 'close'],
    notification: ['notification', 'notify', 'alert'],
  }

  const terms = keywords[type] ?? [type]
  for (const file of files) {
    const name = file.toLowerCase()
    if (terms.some((term) => name.includes(term))) return file
  }
  return files[0] ?? null
}
