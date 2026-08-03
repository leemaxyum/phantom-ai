import { Howl } from 'howler'
import type { SfxType } from '../types'
import { matchSfxFile } from '../utils/helpers'

class AudioService {
  private musicTracks: Howl[] = []
  private currentMusicIndex = 0
  private musicEnabled = true
  private musicVolume = 0.3
  private sfxEnabled = true
  private sfxVolume = 0.5
  private sfxFiles: string[] = []
  private sfxCache = new Map<string, Howl>()
  private initialized = false
  private userInteracted = false
  private fadeDuration = 1500

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true

    console.log('🎵 Initializing Audio Service...')

    try {
      const [musicRes, sfxRes] = await Promise.all([
        fetch('/music/manifest.json'),
        fetch('/sfx/manifest.json'),
      ])

      console.log('🎵 Music manifest:', musicRes.ok)
      console.log('🎵 SFX manifest:', sfxRes.ok)

      const musicFiles: string[] = musicRes.ok ? await musicRes.json() : []
      this.sfxFiles = sfxRes.ok ? await sfxRes.json() : []

      console.log('🎵 Music files:', musicFiles)
      console.log('🎵 Tracks found:', musicFiles.length)

      this.musicTracks = musicFiles.map(
        (file) =>
          new Howl({
            src: [file],
            loop: false,
            volume: 0,
            preload: true,
            onload: () => console.log('✅ Loaded:', file),
            onloaderror: (_, err) =>
              console.error('❌ Load Error:', file, err),
            onplay: () => console.log('▶ Playing:', file),
            onplayerror: (_, err) =>
              console.error('❌ Play Error:', file, err),
            onend: () => this.playNextTrack(),
          }),
      )
    } catch (err) {
      console.error('❌ Audio initialization failed:', err)
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled
    console.log('🎵 Music Enabled:', enabled)

    if (!enabled) {
      this.fadeOutMusic()
    } else if (this.userInteracted) {
      this.fadeInMusic()
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = volume
    console.log('🔊 Music Volume:', volume)

    const current = this.musicTracks[this.currentMusicIndex]
    if (current?.playing()) {
      current.volume(volume)
    }
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = volume
  }

  onUserInteraction(): void {
    console.log('🖱 User interaction detected')
    console.log('Music Enabled:', this.musicEnabled)
    console.log('Tracks Loaded:', this.musicTracks.length)

    if (this.userInteracted) {
      console.log('Already initialized')
      return
    }

    this.userInteracted = true

    if (this.musicEnabled && this.musicTracks.length > 0) {
      console.log('🎵 Starting first track...')
      this.fadeInMusic()
    } else {
      console.log('❌ Cannot start music')
    }
  }

  private playNextTrack(): void {
    if (!this.musicEnabled || this.musicTracks.length === 0) return

    this.currentMusicIndex =
      (this.currentMusicIndex + 1) % this.musicTracks.length

    console.log('⏭ Next Track:', this.currentMusicIndex)

    const track = this.musicTracks[this.currentMusicIndex]

    track.volume(0)
    track.play()
    track.fade(0, this.musicVolume, this.fadeDuration)
  }

  private fadeInMusic(): void {
    if (this.musicTracks.length === 0) {
      console.log('❌ No music tracks available')
      return
    }

    const track = this.musicTracks[this.currentMusicIndex]

    console.log('🎵 Fade In')

    if (!track.playing()) {
      console.log('▶ Calling track.play()')
      track.volume(0)
      track.play()
    }

    track.fade(track.volume(), this.musicVolume, this.fadeDuration)
  }

  private fadeOutMusic(): void {
    const track = this.musicTracks[this.currentMusicIndex]

    if (track?.playing()) {
      console.log('⏸ Fade Out')
      track.fade(track.volume(), 0, this.fadeDuration)
      setTimeout(() => track.stop(), this.fadeDuration)
    }
  }

  playSfx(type: SfxType): void {
    if (!this.sfxEnabled || this.sfxFiles.length === 0) return

    const file = matchSfxFile(this.sfxFiles, type)
    if (!file) return

    let howl = this.sfxCache.get(file)

    if (!howl) {
      howl = new Howl({
        src: [file],
        volume: this.sfxVolume,
      })
      this.sfxCache.set(file, howl)
    } else {
      howl.volume(this.sfxVolume)
    }

    howl.stop()
    howl.play()
  }
}

export const audioService = new AudioService()