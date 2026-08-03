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

const ChatPage = lazy(() =>
  import('./pages/ChatPage').then((m) => ({ default: m.ChatPage })),
)

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ToastProvider>
      <SettingsProvider>
        <ChatProvider>
          <div className="relative h-full w-full overflow-hidden">
            <Background />
            <Particles />
            <CursorGlow />

            <AnimatePresence>
              {loading && <LoadingScreen key="loading" />}
            </AnimatePresence>

            {!loading && (
              <Suspense fallback={<LoadingScreen />}>
                <div className="relative z-10 h-full">
                  <ChatPage />
                </div>
              </Suspense>
            )}

            <ToastContainer />
          </div>
        </ChatProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}

export default App
