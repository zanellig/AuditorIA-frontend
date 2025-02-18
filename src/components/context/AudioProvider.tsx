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
import { useQuery, UseQueryResult } from "@tanstack/react-query"

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
  audioQuery: UseQueryResult<string, Error>
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined)

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)
  const [muted, setMuted] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isAudioPlayerHidden, toggleAudioPlayerHidden] = useState(true)
  // state to hold the current NAS path for the audio file
  const [audioPath, setAudioPath] = useState<string | null>(null)

  const toggleHide = useCallback(() => {
    toggleAudioPlayerHidden(prev => !prev)
  }, [])

  // loadAudio now sets the path which triggers the query.
  const loadAudio = useCallback((nasPath: string) => {
    setAudioPath(nasPath)
  }, [])

  const audioQuery = useQuery({
    queryKey: ["audio", audioPath],
    queryFn: async () => {
      const host = await getHost()
      const response = await fetch(
        `${host}/api/audio?path=${encodeURIComponent(audioPath as string)}`,
        { cache: "force-cache" }
      )
      if (!response.ok) {
        throw new Error("Error fetching audio")
      }
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    },

    enabled: !!audioPath,
  })

  // When the audioUrl is available, update the audio element.
  useEffect(() => {
    if (audioQuery.data && audioRef.current) {
      audioRef.current.src = audioQuery.data
      audioRef.current.load()
      isAudioPlayerHidden && toggleHide()
    }
  }, [audioQuery.data])

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

  const seekAudio = useCallback((seekTime: number) => {
    if (audioRef.current) {
      console.log("seekAudio", seekTime)
      audioRef.current.currentTime = seekTime
    }
  }, [])

  const setPlaybackSpeedHandler = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }, [])

  const contextValue: AudioContextProps = {
    isAudioPlayerHidden,
    isPlaying,
    isLoading: audioQuery.isLoading,
    hasError: !!audioQuery.error,
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
    // expose the full query object
    audioQuery,
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
