"use client"

import React, { Suspense } from "react"
import { useAudioPlayer } from "@/components/context/AudioProvider"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { HashLoader } from "react-spinners"
import { cn } from "@/lib/utils"
import {
  X,
  Music,
  Pause,
  Play,
  TriangleAlert,
  VolumeOff,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

export default function FloatingAudioPlayer({
  fileName = "",
}: {
  fileName?: string
}) {
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
  } = useAudioPlayer()
  // Do not hide the audio player on render

  const [isDragging, setIsDragging] = React.useState(false)
  const [position, setPosition] = React.useState({ right: 20, bottom: 20 })
  const dragRef = React.useRef<{ startX: number; startY: number } | null>(null)

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

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove as any)
      document.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const SPEEDS = [
    { label: "0.5x", value: 0.5 },
    { label: "1x", value: 1 },
    { label: "1.5x", value: 1.5 },
    { label: "2x", value: 2 },
  ]

  const AUDIO_PLAYER_CLASSES = "fixed w-80 select-none p-4 z-10"

  return (
    <Suspense
      fallback={
        <Card
          className={cn(AUDIO_PLAYER_CLASSES, "cursor-wait")}
          style={{
            right: `${position.right}px`,
            bottom: `${position.bottom}px`,
          }}
        >
          Cargando...
        </Card>
      }
    >
      <Card
        className={cn(
          AUDIO_PLAYER_CLASSES,
          isAudioPlayerHidden ? "rounded-full h-fit w-fit p-0" : null
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
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-0 mb-2'>
              <div className='relative h-9 overflow-hidden rounded-md w-full'>
                <div
                  className='absolute inset-0 flex'
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                >
                  <div className='marquee-content whitespace-nowrap font-mono text-sm'>
                    {isLoading && (
                      <span className='text-warning'>Cargando audio:</span>
                    )}
                    {isPlaying && "Reproduciendo audio:"}
                    {hasError && (
                      <span className='text-destructive'>
                        Error al cargar audio:
                      </span>
                    )}
                    {!!fileName && String(fileName)}
                  </div>
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='p-2 rounded-full'
                onClick={toggleHide}
              >
                <X size={GLOBAL_ICON_SIZE} />
              </Button>
            </CardHeader>
            <CardContent className='space-y-2 p-0 mb-2'>
              <div className='flex items-center justify-between'>
                {hasError ? (
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
                    className='rounded-full hover:text-secondary-foreground bg-popover p-2'
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isLoading ? (
                      <HashLoader
                        color='currentColor'
                        loading={true}
                        size={GLOBAL_ICON_SIZE}
                        className='animate-spin'
                      />
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
                onValueChange={([value]) => seekAudio(value)}
                className='w-full'
                aria-label='Seek audio'
              />
            </CardContent>
            <CardFooter className='flex items-center space-x-2 p-0'>
              <Button
                onClick={toggleMute}
                variant='ghost'
                size='icon'
                className='rounded-sm hover:bg-transparent hover:text-secondary-foreground'
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeOff size={GLOBAL_ICON_SIZE} />
                ) : volume === 0 ? (
                  <VolumeX size={GLOBAL_ICON_SIZE} />
                ) : volume > 75 ? (
                  <Volume2 size={GLOBAL_ICON_SIZE} />
                ) : volume > 25 ? (
                  <Volume1 size={GLOBAL_ICON_SIZE} />
                ) : (
                  <Volume size={GLOBAL_ICON_SIZE} />
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
                  {SPEEDS.map((speed, index) => (
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
    </Suspense>
  )
}
