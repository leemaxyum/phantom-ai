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

/** localStorage key where the user's Groq API key ("mask") is kept. */
export const API_KEY_STORAGE_KEY = 'phantom_ai_groq_key'

/** Fired on `window` any time the stored key is set or cleared, so other
 * components (App shell, Settings) can react without prop drilling. */
export const API_KEY_CHANGE_EVENT = 'phantom:apikey-changed'

function dispatchApiKeyChange(): void {
  window.dispatchEvent(new Event(API_KEY_CHANGE_EVENT))
}

export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  } catch {
    return null
  }
}

export function hasApiKey(): boolean {
  const key = getStoredApiKey()
  return !!key && key.trim().length > 0
}

export function setStoredApiKey(key: string): void {
  const trimmed = key.trim()
  if (!trimmed) return
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, trimmed)
  } finally {
    dispatchApiKeyChange()
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  } finally {
    dispatchApiKeyChange()
  }
}

export async function streamChatResponse(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const { onChunk, onError, onComplete } = callbacks

  const apiKey = getStoredApiKey()
  if (!apiKey) {
    onError('No mask found. Please awaken Phantom AI with your Groq API key.')
    return
  }

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt: SYSTEM_PROMPT, apiKey }),
      signal,
    })

    if (!response.ok) {
      if (response.status === 404) {
        onError('Chat service unavailable. Run with npm run dev or deploy to Netlify.')
        return
      }
      if (response.status === 401 || response.status === 403) {
        onError('Invalid mask. Your Groq API key was rejected — check it in Settings.')
        return
      }
      if (response.status === 429) {
        onError('Rate limit reached. Please wait a moment and try again.')
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