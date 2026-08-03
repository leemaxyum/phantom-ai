export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isError?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface AppSettings {
  musicEnabled: boolean
  musicVolume: number
  sfxEnabled: boolean
  sfxVolume: number
  voiceEnabled: boolean
  voiceName: string
  voiceRate: number
  voicePitch: number
  voiceVolume: number
  sidebarOpen: boolean
}

export interface StoredState {
  conversations: Conversation[]
  activeConversationId: string | null
  settings: AppSettings
}

export type SfxType =
  | 'click'
  | 'hover'
  | 'send'
  | 'receive'
  | 'toggle'
  | 'modal'
  | 'notification'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export const DEFAULT_SETTINGS: AppSettings = {
  musicEnabled: true,
  musicVolume: 0.3,
  sfxEnabled: true,
  sfxVolume: 0.5,
  voiceEnabled: false,
  voiceName: '',
  voiceRate: 1,
  voicePitch: 1,
  voiceVolume: 1,
  sidebarOpen: true,
}

export const STORAGE_KEY = 'phantom-ai-state'
