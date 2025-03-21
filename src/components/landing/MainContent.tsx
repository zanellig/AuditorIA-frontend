import { Opulento } from "uvcanvas"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import ParagraphP from "@/components/typography/paragraphP"
import { Button } from "@/components/ui/button"
import { LinkPreview } from "@/components/ui/link-preview"

export function HeroSection() {
  return (
    <section className='relative p-0 content-center h-[calc(100vh-4rem)] select-none'>
      <Opulento className='absolute z-10 top-0 left-0' />
      <div className='absolute z-20 top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center backdrop-blur-md bg-gradient-to-b from-background to-transparent'>
        <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b dark:from-foreground dark:to-secondary from-foreground to-muted-foreground'>
          Auditar llamados <br />
          <TypewriterEffect
            words={[
              {
                text: "nunca",
                className: "dark:animate-sparkle text-blue-600",
              },
              {
                text: "fue",
                className: "dark:animate-sparkle text-blue-600",
              },
              {
                text: "tan",
                className: "dark:animate-sparkle text-blue-600",
              },
              {
                text: "fácil",
                className: "dark:animate-sparkle text-blue-600",
              },
            ]}
            cursorClassName='bg-foreground'
            className='justify-center'
          />
        </h1>
        <ParagraphP className='text-xl sm:text-2xl mb-8 max-w-4xl mx-auto dark:text-muted-foreground text-foreground text-center'>
          Optimice su servicio al cliente con análisis avanzado de llamadas con
          inteligencia artificial, con total control de sus datos.
        </ParagraphP>
        <Button size='lg' asChild>
          <LinkPreview
            url='https://www.linksolution.com.ar/auditoria-de-llamadas-con-ia'
            className='font-bold'
          >
            Solicitar una Demostración
          </LinkPreview>
        </Button>
      </div>
    </section>
  )
}
