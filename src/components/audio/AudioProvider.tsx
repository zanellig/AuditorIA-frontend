import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react"

interface AudioContextProps {
  isPlaying: boolean
  isLoading: boolean
  volume: number
  muted: boolean
  audioDuration: number
  currentTime: number
  play: () => void
  pause: () => void
  toggleMute: () => void
  setVolume: (value: number) => void
  loadAudio: (url: string) => Promise<void>
  seekAudio: (time: number) => void
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined)

export const useAudioPlayer = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioProvider")
  }
  return context
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolumeState] = useState(100)
  const [muted, setMuted] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const loadAudio = useCallback(async (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setIsLoading(true)
    const audio = new Audio(url)
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration)
      setIsLoading(false)
    })

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
    })

    try {
      await audio.load()
    } catch (error) {
      console.error("Error loading audio:", error)
      setIsLoading(false)
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

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setMuted(audioRef.current.muted)
    }
  }, [])

  const setVolume = useCallback((value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value / 100
      setVolumeState(value)
    }
  }, [])

  const seekAudio = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const value = {
    isPlaying,
    isLoading,
    volume,
    muted,
    audioDuration,
    currentTime,
    play,
    pause,
    toggleMute,
    setVolume,
    loadAudio,
    seekAudio,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

// import React, {
//   createContext,
//   useContext,
//   useRef,
//   useState,
//   useEffect,
// } from "react"

// interface AudioContextProps {
//   isPlaying: boolean
//   volume: number
//   playbackSpeed: number
//   muted: boolean
//   play: () => void
//   pause: () => void
//   togglePlayPause: () => void
//   setVolume: (value: number) => void
//   setPlaybackSpeed: (value: number) => void
//   loadAudio: (url: string) => void
//   toggleMute: () => void
// }

// const AudioContext = createContext<AudioContextProps | undefined>(undefined)

// export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const audioRef = useRef<HTMLAudioElement | null>(null)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [volume, setVolumeState] = useState(0.5)
//   const [playbackSpeed, setPlaybackSpeedState] = useState(1)
//   const [muted, setMuted] = useState(false)

//   useEffect(() => {
//     if (audioRef.current) {
//       audioRef.current.volume = volume
//       audioRef.current.playbackRate = playbackSpeed
//       audioRef.current.muted = muted
//     }
//   }, [volume, playbackSpeed, muted])

//   const play = () => {
//     if (audioRef.current) {
//       audioRef.current.play()
//       setIsPlaying(true)
//     }
//   }

//   const pause = () => {
//     if (audioRef.current) {
//       audioRef.current.pause()
//       setIsPlaying(false)
//     }
//   }

//   const togglePlayPause = () => {
//     isPlaying ? pause() : play()
//   }

//   const setVolume = (value: number) => {
//     setVolumeState(value / 100) // Convert from 0-100 to 0-1
//   }

//   const setPlaybackSpeed = (value: number) => {
//     setPlaybackSpeedState(value)
//   }

//   const loadAudio = async (url: string) => {
//     if (audioRef.current) {
//       audioRef.current.src = url
//       audioRef.current.load()
//     }
//   }

//   const toggleMute = () => {
//     setMuted(prevMuted => !prevMuted)
//   }

//   return (
//     <AudioContext.Provider
//       value={{
//         isPlaying,
//         volume,
//         playbackSpeed,
//         muted,
//         play,
//         pause,
//         togglePlayPause,
//         setVolume,
//         setPlaybackSpeed,
//         loadAudio,
//         toggleMute,
//       }}
//     >
//       <audio ref={audioRef} />
//       {children}
//     </AudioContext.Provider>
//   )
// }

// export const useAudio = () => {
//   const context = useContext(AudioContext)
//   if (!context) {
//     throw new Error("useAudio must be used within an AudioProvider")
//   }
//   return context
// }
