"use client"
import { WavyBackground } from "@/components/ui/wavy-background"
import { useMediaQuery } from "@/lib/hooks/use-media-query"

export default function LoginBackground() {
  const isDesktop = useMediaQuery("(min-width: 820px)")
  return (
    <>
      {isDesktop && (
        <section className='w-full h-full p-8 relative overflow-hidden'>
          <WavyBackground
            colors={["#173739", "#21494b", "#f9fafc", "#8beac1", " #58a8ae"]}
          />
        </section>
      )}
    </>
  )
}
