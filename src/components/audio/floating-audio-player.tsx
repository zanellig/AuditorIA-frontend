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
import { DASHBOARD_ICON_CLASSES, SPEAKER_ICON_CLASSES } from "@/lib/consts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import HashLoader from "react-spinners/HashLoader"
import { getAudioPath } from "@/lib/actions"
import { cn } from "@/lib/utils"

interface FloatingAudioPlayerProps {
  file_name: string
}

export default function FloatingAudioPlayer({
  file_name,
}: FloatingAudioPlayerProps) {
  const {
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
    toggleMute,
    setVolume,
    seekAudio,
    setPlaybackSpeed,
    loadAudio,
  } = useAudioPlayer()

  useEffect(() => {
    if (file_name) {
      // if the file_name changes, we fetch the record and extract the URL
      getRecordFromFileName(file_name)
    }

    async function getRecordFromFileName(file_name_param: string) {
      const file_url = await getAudioPath(file_name_param)
      if (file_url) {
        loadAudio(file_url)
      }
    }
  }, [file_name, loadAudio])

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
      // Estimate the dimensions of the player
      const playerWidth = 320 // approximate width of the player
      const playerHeight = 180 // approximate height of the player

      // Calculate new right and bottom positions
      let newRight = dragRef.current.startX - e.clientX
      let newBottom = dragRef.current.startY - e.clientY

      // Ensure the player doesn't go outside the viewport
      if (newRight < 0) newRight = 0
      if (newBottom < 0) newBottom = 0
      if (newRight + playerWidth > innerWidth)
        newRight = innerWidth - playerWidth
      if (newBottom + playerHeight > innerHeight)
        newBottom = innerHeight - playerHeight

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

  return (
    <div
      className={
        "fixed bg-primary-foreground border border-border rounded-xl shadow-md dark:shadow-lg p-4 w-80 select-none text-muted-foreground"
      }
      style={{
        right: `${position.right}px`,
        bottom: `${position.bottom}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className='space-y-2'>
        <div className='flex justify-between gap-2'>
          <div className='relative h-9 overflow-hidden rounded-md w-full'>
            <div
              className='absolute inset-0 flex'
              style={{ top: "50%", transform: "translateY(-50%)" }}
            >
              <div className='marquee-content whitespace-nowrap font-mono text-sm'>
                {!!file_name && !isLoading && !hasError ? (
                  "Reproduciendo audio:"
                ) : isLoading ? (
                  <span className='text-warning'>Cargando audio:</span>
                ) : (
                  hasError && (
                    <span className='text-destructive'>
                      Error al cargar audio:
                    </span>
                  )
                )}{" "}
                {String(file_name)}
              </div>
            </div>
          </div>
          <Button size={"icon"} variant={"ghost"} className='p-2'>
            <Cross1Icon className={DASHBOARD_ICON_CLASSES} />
          </Button>
        </div>
        <div className='flex items-center justify-between'>
          {hasError && !isLoading && (
            <Button
              className='rounded-md text-destructive-foreground p-2'
              disabled
              variant={"destructive"}
            >
              <ExclamationTriangleIcon
                className={cn(DASHBOARD_ICON_CLASSES, "text-current")}
              />
            </Button>
          )}
          {!hasError && (
            <Button
              onClick={isPlaying ? pause : play}
              disabled={isLoading}
              variant='outline'
              size='icon'
              className='rounded-md hover:text-secondary-foreground bg-popover p-2'
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <HashLoader color='white' loading={true} size={20} />
              ) : isPlaying ? (
                <PauseIcon className={DASHBOARD_ICON_CLASSES} />
              ) : (
                <PlayIcon className={DASHBOARD_ICON_CLASSES} />
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
          onValueChange={([value]) => seekAudio((value / audioDuration) * 100)}
          className='w-full'
          aria-label='Seek audio'
        />
        <div className='flex items-center space-x-2'>
          <Button
            onClick={toggleMute}
            variant='ghost'
            size='icon'
            className='rounded-sm hover:bg-transparent hover:shadow-none hover:text-secondary-foreground items-center text-center'
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <SpeakerOffIcon className={SPEAKER_ICON_CLASSES} />
            ) : volume === 0 ? (
              <SpeakerOffIcon className={SPEAKER_ICON_CLASSES} />
            ) : volume > 50 && volume <= 100 ? (
              <SpeakerLoudIcon className={SPEAKER_ICON_CLASSES} />
            ) : volume > 25 && volume <= 50 ? (
              <SpeakerModerateIcon className={SPEAKER_ICON_CLASSES} />
            ) : volume > 0 && volume <= 25 ? (
              <SpeakerQuietIcon className={SPEAKER_ICON_CLASSES} />
            ) : null}
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
              className='w-[80px] bg-popover shadow-md dark:shadow-lg'
              aria-label='Select playback speed'
            >
              <SelectValue placeholder='Speed' />
            </SelectTrigger>
            <SelectContent>
              {speeds.map((speed, index) => (
                <SelectItem
                  key={"speed-selector-" + index}
                  value={speed.value.toString()}
                >
                  {speed.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
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
    </div>
  )
}
