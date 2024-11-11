import * as React from "react"
import Logo from "@/components/logo"
import { TypographyH4 } from "@/components/typography/h4"
import SubtitleH2 from "@/components/typography/subtitleH2"
import TitleH1 from "@/components/typography/titleH1"
import { Button } from "@/components/ui/button"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { ArrowDown } from "lucide-react"
import { Metadata } from "next"
import LoginForm from "./_components/login-form"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import LoginBackground from "./_components/login-background"

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
  if (await isAuthenticated()) {
    redirect("/dashboard")
  }

  return (
    // I don't know why the screen width detection works the other way around. Should be sm:grid-cols-1 logically as the small screen should trigger the mobile layout.
    <main className='grid grid-flow-row  sm:grid-cols-2 grid-cols-1 h-screen'>
      <section className='w-full h-full py-8 md:px-24 px-32 p flex flex-col justify-between items-center outline outline-1 outline-muted border-muted dark:bg-primary-foreground'>
        <div className='flex gap-4 items-center justify-center'>
          <Logo width={36} height={36} />
          <SubtitleH2>AuditorIA</SubtitleH2>
        </div>
        <article className='flex flex-col gap-8 items-center'>
          <TitleH1 className='text-center'>
            Revolucioná tu forma de
            <br /> auditar llamados
          </TitleH1>

          <TypographyH4 className='text-center text-muted-foreground'>
            Servicio de auditoría de llamadas de alta calidad,
            <br /> con un enfoque en la{" "}
            <span className='animate-sparkle'>transparencia</span> y la
            seguridad.
          </TypographyH4>

          <div className='w-96'>
            <LoginForm />
          </div>
        </article>

        <Button
          variant='outline'
          className='flex gap-2 items-center w-fit justify-self-center'
        >
          <ArrowDown size={GLOBAL_ICON_SIZE} className='animate-bounce' />
          <span>Aprendé más</span>
        </Button>
      </section>
      <LoginBackground />
    </main>
  )
}
