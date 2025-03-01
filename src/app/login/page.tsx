import { TypographyH4 } from "@/components/typography/h4"
import TitleH1 from "@/components/typography/titleH1"
import { Metadata } from "next"
import LoginForm from "./_components/login-form"
import LoginBackground from "./_components/login-background"
import { ScrollArea } from "@/components/ui/scroll-area"

export const metadata: Metadata = {
  title: "Iniciar Sesión | AuditorIA - Auditoría de Llamadas Inteligente",
  description:
    "Accede a AuditorIA, tu plataforma de auditoría de llamadas con IA. Servicio de alta calidad con enfoque en transparencia y seguridad.",
  keywords:
    "auditoría de llamadas, IA, calidad de llamadas, transparencia, seguridad, login",
  openGraph: {
    title: "Iniciar Sesión | AuditorIA - Auditoría de Llamadas Inteligente",
    description:
      "Accede a AuditorIA, tu plataforma de auditoría de llamadas con IA. Servicio de alta calidad con enfoque en transparencia y seguridad.",
    type: "website",
    locale: "es_ES",
    siteName: "AuditorIA",
  },
}

export default async function LoginPage() {
  return (
    <main className='w-dvw min-w-dvw h-dvh min-h-dvh'>
      <ScrollArea>
        <div className='flex lg:flex-row flex-col'>
          <section className='w-full h-dvh py-8 px-8 sm:px-0 flex flex-col justify-between items-center outline outline-1 outline-muted border-muted dark:bg-primary-foreground'>
            <article className='flex flex-col gap-8 items-center justify-center h-full'>
              <TitleH1 className='text-center'>
                Revolucioná tu forma
                <br /> de auditar llamados
              </TitleH1>

              <TypographyH4 className='text-center text-muted-foreground flex flex-col'>
                <p>Servicio de auditoría de llamadas de alta calidad,</p>
                <p>
                  con un enfoque en la{" "}
                  <span className='animate-sparkle'>transparencia</span> y la
                  seguridad.
                </p>
              </TypographyH4>

              <div className='w-full'>
                <LoginForm />
              </div>
            </article>
          </section>
          <LoginBackground />
        </div>
      </ScrollArea>
    </main>
  )
}
