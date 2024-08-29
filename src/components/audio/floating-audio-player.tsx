"use client"
import {
  PauseIcon,
  PlayIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
} from "@radix-ui/react-icons"
import { Card, CardContent } from "../ui/card"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Slider } from "../ui/slider"
import { cn } from "@/lib/utils"
import * as React from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip"
import { useAudioPlayer } from "@/components/audio/AudioProvider"
import CircleLoader from "react-spinners/CircleLoader"

const INITIAL_GAIN = 50

export default function FloatingAudioPlayer() {
  const {
    isPlaying,
    isLoading,
    volume,
    muted,
    play,
    pause,
    toggleMute,
    setVolume,
    loadAudio,
    audioDuration,
    currentTime,
    seekAudio,
  } = useAudioPlayer()
  React.useEffect(() => {
    loadAudio("/path/to/your/audio/file.mp3") // Replace with the actual audio file path
  }, [loadAudio])

  function handlePlayback() {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  return (
    <Card className='lg:w-full h-fit absolute bottom-4 left-4'>
      <CardContent className='p-6'>
        <div className='flex flex-row items-center gap-2 justify-between'>
          <Button
            variant='ghost'
            className='rounded-full p-5 relative'
            onClick={handlePlayback}
            disabled={isLoading}
          >
            {!isLoading ? (
              <>
                <PlayIcon
                  className={cn(
                    DASHBOARD_ICON_CLASSES,
                    "transition-all duration-200 absolute",
                    isPlaying && "-rotate-90 opacity-0"
                  )}
                />
                <PauseIcon
                  className={cn(
                    DASHBOARD_ICON_CLASSES,
                    "opacity-0 transition-all duration-200 absolute rotate-90",
                    isPlaying && "rotate-0 opacity-100"
                  )}
                />
              </>
            ) : (
              <CircleLoader
                size={25}
                color={"var(--foreground)"}
                loading={isLoading}
              />
            )}
          </Button>
          <Slider
            value={[currentTime]}
            max={audioDuration}
            step={1}
            className='w-[60%]'
            orientation='horizontal'
            onValueChange={([value]) => seekAudio(value)}
            disabled={isLoading}
          />
          <span className='text-muted-foreground text-sm text-nowrap'>{`${Math.round(
            currentTime
          )} / ${Math.round(audioDuration)}`}</span>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleMute}
                  disabled={isLoading}
                  variant='ghost'
                  className='rounded-full p-5'
                >
                  {muted ? (
                    <SpeakerOffIcon className={DASHBOARD_ICON_CLASSES} />
                  ) : (
                    <SpeakerLoudIcon className={DASHBOARD_ICON_CLASSES} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className='w-fit h-fit border bg-popover translate-x-2 p-2 m-0 flex flex-row gap-2'>
                <Slider
                  defaultValue={[INITIAL_GAIN]}
                  max={100}
                  step={1}
                  className='lg:h-[150px]'
                  orientation='vertical'
                  onValueChange={([value]) => setVolume(value)}
                />
                <div className='flex flex-col items-center gap-2 justify-between text-muted-foreground'>
                  <span>100%</span>
                  <span>50%</span>
                  <span>0%</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
