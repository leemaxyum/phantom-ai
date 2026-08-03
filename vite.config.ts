import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleChatRequest } from './shared/chatHandler.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const AUDIO_EXTENSIONS = ['.mp3', '.wav']

function scanAudioDir(dir: string): string[] {
  const fullPath = path.resolve(__dirname, dir)
  if (!fs.existsSync(fullPath)) return []
  return fs
    .readdirSync(fullPath)
    .filter((file) => AUDIO_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .map((file) => `/${dir.replace(/^public\//, '')}/${file}`)
}

function audioManifestPlugin(): Plugin {
  const writeManifests = () => {
    const music = scanAudioDir('public/music')
    const sfx = scanAudioDir('public/sfx')

    fs.writeFileSync(
      path.resolve(__dirname, 'public/music/manifest.json'),
      JSON.stringify(music, null, 2),
    )

    fs.writeFileSync(
      path.resolve(__dirname, 'public/sfx/manifest.json'),
      JSON.stringify(sfx, null, 2),
    )
  }

  return {
    name: 'audio-manifest',

    buildStart() {
      writeManifests()
    },

    configureServer(server) {
      writeManifests()

      server.watcher.on('add', (file) => {
        if (file.includes('public/music') || file.includes('public/sfx')) {
          writeManifests()
        }
      })

      server.watcher.on('unlink', (file) => {
        if (file.includes('public/music') || file.includes('public/sfx')) {
          writeManifests()
        }
      })

      server.middlewares.use('/.netlify/functions/chat', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''

        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
        })

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body)

            const apiKey = process.env.GROQ_API_KEY ?? ''

            await handleChatRequest(parsed, apiKey, res)
          } catch (err) {
            console.error(err)
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid request body' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), audioManifestPlugin()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/')
          ) {
            return 'vendor'
          }

          if (id.includes('node_modules/framer-motion')) {
            return 'motion'
          }

          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/react-syntax-highlighter')
          ) {
            return 'markdown'
          }
        },
      },
    },
  },
})