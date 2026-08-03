import type { StoredState, AppSettings } from '../types'
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../types'

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        conversations: [],
        activeConversationId: null,
        settings: { ...DEFAULT_SETTINGS },
      }
    }
    const parsed = JSON.parse(raw) as StoredState
    return {
      conversations: parsed.conversations ?? [],
      activeConversationId: parsed.activeConversationId ?? null,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    }
  } catch {
    return {
      conversations: [],
      activeConversationId: null,
      settings: { ...DEFAULT_SETTINGS },
    }
  }
}

export function saveState(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable
  }
}

export function exportChats(state: StoredState): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      conversations: state.conversations,
    },
    null,
    2,
  )
}

export function importChats(json: string, current: StoredState): StoredState {
  const parsed = JSON.parse(json) as {
    conversations?: StoredState['conversations']
  }
  if (!parsed.conversations || !Array.isArray(parsed.conversations)) {
    throw new Error('Invalid import file format')
  }
  const merged = [...current.conversations]
  for (const conv of parsed.conversations) {
    if (!merged.some((c) => c.id === conv.id)) {
      merged.unshift(conv)
    }
  }
  return { ...current, conversations: merged }
}

export function resetSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS }
}
