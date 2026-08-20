# Phantom AI

A premium AI chatbot web application powered by Google Gemini. Phantom AI features an original personality inspired by a calm, intelligent phantom thief — elegant, observant, and quietly witty.

![Phantom AI](public/background/background.png)

## Features

- **Streaming AI responses** with Google Gemini
- **Markdown rendering** with syntax-highlighted code blocks
- **Multiple conversations** with search, rename, and delete
- **Local storage persistence** for chats and settings
- **Background music & sound effects** (auto-discovers MP3/WAV files in `/public/music/` and `/public/sfx/`)
- **Text-to-speech** for assistant replies via browser SpeechSynthesis
- **Animated UI** with Framer Motion micro-interactions
- **Secure API** — Gemini key stays server-side via Netlify Functions

## Installation

```bash
git clone https://github.com/yourusername/phantom-ai.git
cd phantom-ai
npm install
```

## Environment Variables

Copy the example env file and add your Gemini API key:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key ([Get one here](https://aistudio.google.com/apikey)) |

> **Important:** The API key is only used server-side. It is never exposed in frontend code.

## Development

```bash
# Set your API key
echo GEMINI_API_KEY=your_key_here > .env

# Start dev server (includes API proxy)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New conversation |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+,` | Open settings |
| `Ctrl+K` | Focus input |

## Adding Audio

Place audio files in the public folders — no configuration needed:

```
public/music/    → Background music (MP3/WAV, loops automatically)
public/sfx/      → Sound effects (matched by filename)
```

**SFX filename hints:** `click`, `hover`, `send`, `receive`, `toggle`, `modal`, `notification`

Manifests are auto-generated at dev/build time.

## Netlify Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Phantom AI chatbot"
git branch -M main
git remote add origin https://github.com/yourusername/phantom-ai.git
git push -u origin main
```

### 2. Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com) and click **Add new site → Import an existing project**
2. Connect your GitHub repository
3. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
4. Add environment variable:
   - `GEMINI_API_KEY` = your Gemini API key
5. Deploy

### 3. Verify

Visit your Netlify URL and start a conversation. The chat function runs at `/.netlify/functions/chat`.

## Project Structure

```
public/
  background/     Background image
  music/          Background music files
  sfx/            Sound effect files
src/
  components/     UI components
  context/        React context providers
  hooks/          Custom hooks
  pages/          Page components
  prompts/        AI system prompt
  services/       API and audio services
  utils/          Helpers and storage
netlify/
  functions/      Serverless API (Gemini proxy)
shared/           Shared server logic
```

## Troubleshooting

### "Missing API key" error
Set `GEMINI_API_KEY` in your `.env` file (local) or Netlify environment variables (production).

### Chat service unavailable (404)
- **Local dev:** Ensure `npm run dev` is running — the Vite dev server includes an API proxy
- **Production:** Verify Netlify Functions are deployed and `netlify.toml` redirects are configured

### Rate limit errors
Gemini free tier has rate limits. Wait a moment and retry.

### Music/SFX not playing
- Add MP3 or WAV files to `public/music/` or `public/sfx/`
- Music requires a user interaction (click/type) before autoplay
- Check Settings → enable music/SFX and adjust volume

### Voice not working
- Enable "Read replies aloud" in Settings
- Select a voice from the dropdown (requires browser support)
- Some browsers need an online connection for certain voices

## Tech Stack

- React 19 + TypeScript + Vite
- TailwindCSS 4
- Framer Motion
- Google Gemini API
- React Markdown + Syntax Highlighter
- Howler.js
- Netlify Functions

## License

MIT
"# Phantom AI" 
