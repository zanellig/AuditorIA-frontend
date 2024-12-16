// @/components/audio/AudioProvider.tsx
"use client"
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react"
import { getHost } from "@/lib/actions"
interface AudioContextProps {
  isAudioPlayerHidden: boolean
  isPlaying: boolean
  isLoading: boolean
  hasError: boolean
  volume: number
  muted: boolean
  audioDuration: number
  currentTime: number
  playbackSpeed: number
  play: () => void
  pause: () => void
  stop: () => void
  toggleMute: () => void
  toggleHide: () => void
  setVolume: (value: number) => void
  seekAudio: (percentage: number) => void
  setPlaybackSpeed: (speed: number) => void
  loadAudio: (nasPath: string) => void
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined)

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setError] = useState(false)
  const [volume, setVolume] = useState(75)
  const [muted, setMuted] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isAudioPlayerHidden, toggleAudioPlayerHidden] = useState(true)

  const toggleHide = useCallback(() => {
    toggleAudioPlayerHidden(prev => !prev)
  }, [])

  const loadAudio = useCallback(
    async (nasPath: string) => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `${await getHost()}/api/audio?path=${encodeURIComponent(nasPath)}`,
          { cache: "force-cache" }
        )
        if (!response.ok) {
          setError(true)
        }
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.load()
          setError(false)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(e.message)
        setError(true)
      } finally {
        setIsLoading(false)
        if (isAudioPlayerHidden) {
          toggleHide()
        }
      }
    },
    [isAudioPlayerHidden, toggleHide]
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoadedMetadata = () => setAudioDuration(audio.duration)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
    }
  }, [])

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setMuted(audioRef.current.muted)
    }
  }, [])

  const setVolumeHandler = useCallback((value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value / 100
      setVolume(value)
    }
  }, [])

  const seekAudio = useCallback((percentage: number) => {
    if (audioRef.current) {
      const newTime = (percentage / 100) * audioRef.current.duration
      audioRef.current.currentTime = newTime
    }
  }, [])

  const setPlaybackSpeedHandler = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }, [])

  const contextValue = {
    isAudioPlayerHidden,
    isPlaying,
    isLoading,
    hasError,
    volume,
    muted,
    audioDuration,
    currentTime,
    playbackSpeed,
    play,
    pause,
    stop,
    toggleMute,
    toggleHide,
    setVolume: setVolumeHandler,
    seekAudio,
    setPlaybackSpeed: setPlaybackSpeedHandler,
    loadAudio,
  }

  return (
    <AudioContext.Provider value={contextValue}>
      <audio ref={audioRef} />
      {children}
    </AudioContext.Provider>
  )
}

export const useAudioPlayer = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioProvider")
  }
  return context
}
