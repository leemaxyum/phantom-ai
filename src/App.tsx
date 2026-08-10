import { lazy, Suspense, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ToastProvider } from './context/ToastContext'
import { SettingsProvider } from './context/SettingsContext'
import { ChatProvider } from './context/ChatContext'
import { Background } from './components/Background'
import { Particles } from './components/Particles'
import { LoadingScreen } from './components/LoadingScreen'
import { ToastContainer } from './components/Toast'
import { CursorGlow } from './components/CursorGlow'
import { AwakeningScreen } from './components/AwakeningScreen'
import { VideoOverlay } from './components/VideoOverlay'
import { hasApiKey, API_KEY_CHANGE_EVENT } from './services/gemini'

const ChatPage = lazy(() =>
  import('./pages/ChatPage').then((m) => ({ default: m.ChatPage })),
)

function App() {
  const [apiKeyPresent, setApiKeyPresent] = useState(() => hasApiKey())
  const [loading, setLoading] = useState(apiKeyPresent)
  const [easterEggOpen, setEasterEggOpen] = useState(false)

  // Only run the loading sequence once a key is present — either it was
  // already there on launch, or the user just completed the Awakening.
  useEffect(() => {
    if (!apiKeyPresent) return

    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [apiKeyPresent])

  useEffect(() => {
    const handleApiKeyChange = () => setApiKeyPresent(hasApiKey())
    window.addEventListener(API_KEY_CHANGE_EVENT, handleApiKeyChange)
    return () => window.removeEventListener(API_KEY_CHANGE_EVENT, handleApiKeyChange)
  }, [])

  return (
    <ToastProvider>
      <SettingsProvider>
        <ChatProvider>
          <div className="relative h-full w-full overflow-hidden">
            <Background />
            <Particles />
            <CursorGlow />

            {!apiKeyPresent && <AwakeningScreen />}

            {apiKeyPresent && (
              <>
                <AnimatePresence>
                  {loading && <LoadingScreen key="loading" />}
                </AnimatePresence>

                {!loading && (
                  <Suspense fallback={<LoadingScreen />}>
                    <div className="relative z-10 h-full">
                      <ChatPage onSecretTrigger={() => setEasterEggOpen(true)} />
                    </div>
                  </Suspense>
                )}
              </>
            )}

            <ToastContainer />

            <VideoOverlay open={easterEggOpen} onFinished={() => setEasterEggOpen(false)} />
          </div>
        </ChatProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}

export default App