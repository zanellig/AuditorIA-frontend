"use client"

import React, { useState, useEffect, useRef } from "react"
import { useAudioPlayer } from "@/components/context/AudioProvider"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Cross1Icon,
  ExclamationTriangleIcon,
  PauseIcon,
  PlayIcon,
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from "@radix-ui/react-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { HashLoader } from "react-spinners"
import { getAudioPath } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { Music, Pause, Play, TriangleAlert } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

interface FloatingAudioPlayerProps {
  fileName: string
}

export default function FloatingAudioPlayer({
  fileName,
}: FloatingAudioPlayerProps) {
  const {
    isAudioPlayerHidden,
    isPlaying,
    isLoading,
    hasError,
    volume,
    muted,
    audioDuration,
    currentTime,
    playbackSpeed,
    toggleHide,
    play,
    pause,
    toggleMute,
    setVolume,
    seekAudio,
    setPlaybackSpeed,
    loadAudio,
  } = useAudioPlayer()

  useEffect(() => {
    if (fileName) {
      getAudioPath(fileName).then(fileUrl => {
        if (fileUrl) loadAudio(fileUrl)
      })
    }
  }, [fileName, loadAudio])

  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ right: 20, bottom: 20 })
  const dragRef = useRef<{ startX: number; startY: number } | null>(null)

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX + position.right,
      startY: e.clientY + position.bottom,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragRef.current) {
      // Get viewport dimensions
      const { innerWidth, innerHeight } = window
      // FIXME: When the player is hidden, the boundaries are calculated "incorrectly", given that the dimensions of the player are a rough guess. The boudaries should be calculated based on the actual dimensions that the Card takes.
      const playerWidth = 320
      const playerHeight = 180

      // Calculate the new right position, ensuring it stays within the window bounds
      let newRight = Math.max(
        0,
        Math.min(dragRef.current.startX - e.clientX, innerWidth - playerWidth)
      )
      let newBottom = Math.max(
        0,
        Math.min(dragRef.current.startY - e.clientY, innerHeight - playerHeight)
      )

      setPosition({ right: newRight, bottom: newBottom })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    dragRef.current = null
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove as any)
      document.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const speeds = [
    { label: "0.5x", value: 0.5 },
    { label: "1x", value: 1 },
    { label: "1.5x", value: 1.5 },
    { label: "2x", value: 2 },
  ]

  const isReproducing = !!fileName && !isLoading && !hasError
  const isLoadingAudio = isLoading && !!fileName
  const hasLoadingError = hasError && !!fileName

  return (
    <Card
      className={cn(
        "fixed w-80 select-none",
        isAudioPlayerHidden ? "rounded-full h-fit w-fit" : null
      )}
      style={{
        right: `${position.right}px`,
        bottom: `${position.bottom}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {!isAudioPlayerHidden ? (
        <>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div className='relative h-9 overflow-hidden rounded-md w-full'>
              <div
                className='absolute inset-0 flex'
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                <div className='marquee-content whitespace-nowrap font-mono text-sm'>
                  {isReproducing ? (
                    "Reproduciendo audio:"
                  ) : isLoadingAudio ? (
                    <span className='text-warning'>Cargando audio:</span>
                  ) : hasLoadingError ? (
                    <span className='text-destructive'>
                      Error al cargar audio:
                    </span>
                  ) : null}{" "}
                  {!!fileName && String(fileName)}
                </div>
              </div>
            </div>
            <Button variant='ghost' size='icon' onClick={toggleHide}>
              <Cross1Icon className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              {hasLoadingError ? (
                <Button
                  className='rounded-md text-destructive-foreground p-2'
                  disabled
                  variant='destructive'
                  size='icon'
                  aria-label={"Error playing audio"}
                >
                  <TriangleAlert size={GLOBAL_ICON_SIZE} />
                </Button>
              ) : (
                <Button
                  onClick={isPlaying ? pause : play}
                  disabled={isLoading}
                  variant='outline'
                  size='icon'
                  className='rounded-md hover:text-secondary-foreground bg-popover p-2'
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isLoading ? (
                    <HashLoader color='currentColor' loading={true} size={20} />
                  ) : isPlaying ? (
                    <Pause size={GLOBAL_ICON_SIZE} />
                  ) : (
                    <Play size={GLOBAL_ICON_SIZE} />
                  )}
                </Button>
              )}
              <span className='text-sm'>
                {formatTime(currentTime)} / {formatTime(audioDuration)}
              </span>
            </div>
            <Slider
              value={[currentTime]}
              max={audioDuration}
              step={0.1}
              onValueChange={([value]) =>
                seekAudio((value / audioDuration) * 100)
              }
              className='w-full'
              aria-label='Seek audio'
            />
          </CardContent>
          <CardFooter className='flex items-center space-x-2'>
            <Button
              onClick={toggleMute}
              variant='ghost'
              size='icon'
              className='rounded-sm hover:bg-transparent hover:text-secondary-foreground'
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? (
                <SpeakerOffIcon className='h-4 w-4' />
              ) : volume > 50 ? (
                <SpeakerLoudIcon className='h-4 w-4' />
              ) : volume > 25 ? (
                <SpeakerModerateIcon className='h-4 w-4' />
              ) : (
                <SpeakerQuietIcon className='h-4 w-4' />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={([value]) => setVolume(value)}
              className='w-24'
              aria-label='Adjust volume'
            />
            <Select
              value={playbackSpeed.toString()}
              onValueChange={value => setPlaybackSpeed(parseFloat(value))}
            >
              <SelectTrigger
                className='w-[80px] bg-popover'
                aria-label='Select playback speed'
              >
                <SelectValue placeholder='Speed' />
              </SelectTrigger>
              <SelectContent>
                {speeds.map((speed, index) => (
                  <SelectItem
                    key={`speed-selector-${index}`}
                    value={speed.value.toString()}
                  >
                    {speed.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardFooter>
          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            .marquee-content {
              display: inline-block;
              padding-left: 50%;
              animation: marquee 15s linear infinite;
            }
          `}</style>
        </>
      ) : (
        <Button
          onClick={toggleHide}
          className='rounded-full shadow-md hover:shadow-lg transition-shadow w-fit h-fit p-3'
          size='icon'
          variant='secondary'
        >
          <Music size={GLOBAL_ICON_SIZE} />
        </Button>
      )}
    </Card>
  )
}
