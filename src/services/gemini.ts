import { SYSTEM_PROMPT } from '../prompts/systemPrompt'

export interface StreamCallbacks {
  onChunk: (text: string) => void
  onError: (error: string) => void
  onComplete: () => void
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const CHAT_ENDPOINT = '/.netlify/functions/chat'

export async function streamChatResponse(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const { onChunk, onError, onComplete } = callbacks

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt: SYSTEM_PROMPT }),
      signal,
    })

    if (!response.ok) {
      if (response.status === 404) {
        onError('Chat service unavailable. Run with npm run dev or deploy to Netlify.')
        return
      }
      onError(`Server error (${response.status}). Please try again.`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError('Streaming not supported in this browser.')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6)) as {
            chunk?: string
            error?: string
            done?: string
          }
          if (data.error) {
            onError(data.error)
            return
          }
          if (data.chunk) onChunk(data.chunk)
          if (data.done) {
            onComplete()
            return
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }

    onComplete()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    if (!navigator.onLine) {
      onError('No internet connection. Check your network and try again.')
      return
    }
    onError(error instanceof Error ? error.message : 'An unexpected error occurred.')
  }
}
