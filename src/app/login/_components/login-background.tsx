"use client"
import Logo from "@/components/logo"
import SubtitleH2 from "@/components/typography/subtitleH2"
import { Button } from "@/components/ui/button"
import { WavyBackground } from "@/components/ui/wavy-background"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function LoginBackground({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "w-full max-w-dvw min-h-dvh max-h-dvh relative p-8 overflow-hidden hidden lg:inline-block",
        className
      )}
    >
      <WavyBackground
        colors={["#173739", "#21494b", "#f9fafc", "#8beac1", " #58a8ae"]}
        containerClassName='bg-background'
      >
        <div className='absolute top-0 right-0'>
          <Link href='/'>
            <div className='flex gap-4 items-center justify-center'>
              <Logo width={36} height={36} />
              <SubtitleH2 className='text-secondary dark:text-foreground'>
                AuditorIA
              </SubtitleH2>
            </div>
          </Link>
        </div>
        <div className='absolute bottom-14 right-0'>
          <Link href='/'>
            <Button
              variant='outline'
              className='flex gap-2 items-center w-fit justify-self-center'
            >
              Aprendé más
            </Button>
          </Link>
        </div>
      </WavyBackground>
    </section>
  )
}
