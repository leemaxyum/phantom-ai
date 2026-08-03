import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'

export function useSpeech() {
  const { settings } = useSettings()
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel()
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!settings.voiceEnabled || !window.speechSynthesis) return

      cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = settings.voiceRate
      utterance.pitch = settings.voicePitch
      utterance.volume = settings.voiceVolume

      if (settings.voiceName) {
        const voices = window.speechSynthesis.getVoices()
        const voice = voices.find((v) => v.name === settings.voiceName)
        if (voice) utterance.voice = voice
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [settings, cancel],
  )

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      cancel()
    }
  }, [cancel])

  return { speak, cancel }
}

export function useAvailableVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const update = () => {
      setVoices(window.speechSynthesis.getVoices())
    }
    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  return voices
}
