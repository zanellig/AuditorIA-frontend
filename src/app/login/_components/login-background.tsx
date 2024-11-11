"use client"
import Logo from "@/components/logo"
import SubtitleH2 from "@/components/typography/subtitleH2"
import { Button } from "@/components/ui/button"
import { WavyBackground } from "@/components/ui/wavy-background"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { ArrowDown } from "lucide-react"

export default function LoginBackground() {
  return (
    <>
      <section className='w-full h-full p-8 relative overflow-hidden'>
        <WavyBackground
          colors={["#173739", "#21494b", "#f9fafc", "#8beac1", " #58a8ae"]}
        >
          <div className='absolute top-0'>
            <div className='flex gap-4 items-center justify-center'>
              <Logo width={36} height={36} />
              <SubtitleH2>AuditorIA</SubtitleH2>
            </div>
          </div>
          <div className='absolute bottom-14'>
            <Button
              variant='outline'
              className='flex gap-2 items-center w-fit justify-self-center'
            >
              <ArrowDown size={GLOBAL_ICON_SIZE} className='animate-bounce' />
              <span>Aprendé más</span>
            </Button>
          </div>
        </WavyBackground>
      </section>
    </>
  )
}
