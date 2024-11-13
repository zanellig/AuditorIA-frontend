import { Metadata } from "next"
import SignupForm from "./_components/signup-form"
import { WavyBackground } from "@/components/ui/wavy-background"

export const metadata: Metadata = {
  title: "Registrarse | AuditorIA - Auditoría de Llamadas Inteligente",
  description:
    "Registrate en AuditorIA, tu plataforma de auditoría de llamadas con IA. Servicio de alta calidad con enfoque en transparencia y seguridad.",
  keywords:
    "auditoría de llamadas, IA, calidad de llamadas, inteligencia artificial, machine learning, transparencia, seguridad, signup",
  openGraph: {
    title: "Registrarse | AuditorIA - Auditoría de Llamadas Inteligente",
    description:
      "Registrate en AuditorIA, tu plataforma de auditoría de llamadas con IA. Servicio de alta calidad con enfoque en transparencia y seguridad.",
    type: "website",
    locale: "es_ES",
    siteName: "AuditorIA",
  },
}

export default function SignupPage() {
  return (
    <main className='w-dvw h-dvh relative'>
      <WavyBackground
        colors={["#173739", "#21494b", "#f9fafc", "#8beac1", " #58a8ae"]}
        className='absolute w-full h-full'
      >
        <SignupForm />
      </WavyBackground>
    </main>
  )
}
