import React, { Suspense } from "react"
import AudioPlayerContent from "@/components/audio/audio-player-content"
import FloatingAudioPlayer from "@/components/audio/floating-audio-player"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

export default function AudioPlayerWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Suspense
        fallback={
          <Card
            className='fixed w-80 select-none p-4 cursor-wait'
            style={{
              right: `${20}px`,
              bottom: `${20}px`,
            }}
          >
            <Loader2 size={GLOBAL_ICON_SIZE} className='animate-spin' />
          </Card>
        }
      >
        <AudioPlayerContent>
          <FloatingAudioPlayer />
        </AudioPlayerContent>
      </Suspense>
    </>
  )
}
