"use client"
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons"
import { Card, CardContent } from "../ui/card"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Slider } from "../ui/slider"
import { cn } from "@/lib/utils"
import * as React from "react"

export default function FloatingAudioPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false)
  return (
    <Card className='w-[500px] h-fit absolute bottom-4 left-4'>
      <CardContent className='p-6'>
        <audio id='audio-player'>
          <source
            src='https://www.w3schools.com/tags/horse.ogg'
            type='audio/ogg'
          />
          <source
            src='https://www.w3schools.com/tags/horse.mp3'
            type='audio/mpeg'
          />
          Your browser does not support the audio element.
        </audio>
        <div className='flex flex-row items-center gap-2 '>
          <Button
            variant='ghost'
            className='rounded-full p-5 relative'
            onClick={() => {
              setIsPlaying(!isPlaying)
            }}
          >
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
          </Button>
          <Slider defaultValue={[0]} max={100} step={1} className='w-[60%]' />
        </div>
      </CardContent>
    </Card>
  )
}
