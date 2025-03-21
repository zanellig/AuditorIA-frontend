import {
  FileText,
  BarChart,
  Shield,
  Users,
  Bot,
  Hourglass,
  Activity,
  Handshake,
  ChartSpline,
  Braces,
  Scale,
  Fingerprint,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Logo from "@/components/logo"
import type { Metadata } from "next"
import { LoginButton } from "./_client-buttons/buttons"
import { ModeToggle } from "@/components/navigation/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import ParagraphP from "@/components/typography/paragraphP"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"

import dynamic from "next/dynamic"

const HeroSection = dynamic(
  () => import("@/components/landing/MainContent").then(mod => mod.HeroSection),
  {
    ssr: false,
    loading: () => (
      <div className='h-[calc(100vh-4rem)] w-full flex items-center justify-center'>
        <Loader2 className='animate-spin' />
      </div>
    ),
  }
)

const LinkPreview = dynamic(
  () => import("@/components/ui/link-preview").then(mod => mod.LinkPreview),
  {
    ssr: false,
    loading: () => <Loader2 className='animate-spin' />,
  }
)

export const metadata: Metadata = {
  title:
    "AuditorIA - Software y Servicio de Auditoría de Llamadas con IA en Argentina",
  description:
    "AuditorIA ofrece análisis avanzado de llamadas con IA, maximizando la calidad de las interacciones y cumpliendo con las leyes argentinas. Mejore su servicio al cliente hoy.",
  keywords:
    "auditoría de llamadas, inteligencia artificial, servicio al cliente, Argentina, cumplimiento legal, contact center, optimización de recursos",
  openGraph: {
    title:
      "AuditorIA - Software y Servicio de Auditoría de Llamadas con IA en Argentina",
    description:
      "Mejore su servicio al cliente con análisis avanzado de llamadas, cumpliendo con las leyes argentinas y con total control de sus datos.",
    url: "http://auditoria.linksolution.com.ar",
    siteName: "AuditorIA",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "AuditorIA - Software y Servicio de Auditoría de Llamadas con IA en Argentina",
    description:
      "Mejore su servicio al cliente con análisis avanzado de llamadas, cumpliendo con las leyes argentinas y con total control de sus datos.",
  },
  alternates: {
    canonical: "http://auditoria.linksolution.com.ar",
  },
}

export default function Home() {
  return (
    <>
      <ScrollArea className='flex p-0 w-full h-dvh bg-background'>
        <div className='min-h-dvh max-w-full bg-background text-foreground'>
          <header className='sticky z-30 top-0 py-4 px-4 sm:px-6 lg:px-8 h-16 backdrop-blur-sm bg-gradient-to-b from-background to-transparent'>
            <div className='container mx-auto flex justify-between items-center'>
              <Link
                href='/'
                className='relative flex w-fit items-center gap-2 overflow-hidden lg:px-3'
              >
                <Logo width={24} height={24} />
                <span className='font-bold text-lg'>
                  AUDITOR<span className='animate-sparkle'>IA</span>
                </span>
              </Link>
              <nav className='flex items-center space-x-4'>
                <LoginButton />
                <ModeToggle />
              </nav>
            </div>
          </header>

          <main>
            <HeroSection />

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100dvh)] bg-primary-foreground'>
              <h2 className='text-3xl sm:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-b dark:from-foreground dark:to-secondary from-black to-neutral-600'>
                Características Principales
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto'>
                {[
                  {
                    icon: <Bot />,
                    title: "Auditoría automática del 100% de las llamadas",
                    description: "Sus llamados, auditados en su totalidad.",
                  },
                  {
                    icon: <Hourglass />,
                    title: "Transcripción y análisis en tiempo real",
                    description:
                      "Nuestro robusto sistema de auditoría detecta los llamados problemáticos y los reporta en tiempo real.",
                  },
                  {
                    icon: <Activity />,
                    title: "Análisis y detección de emociones clave",
                    description:
                      "Utilizamos avanzados algoritmos pre-entrenados con llamados reales para detectar emociones y sentimientos clave.",
                  },
                  {
                    icon: <Handshake />,
                    title: "Validación de ventas y cumplimiento legal",
                    description:
                      "Validamos que las ventas cumplan las normativas legales y mejoramos la experiencia del cliente al priorizar reclamaciones urgentes y detectar insatisfacción rápidamente.",
                  },
                  {
                    icon: <ChartSpline />,
                    title: "Estadísticas y reportes automatizados",
                    description:
                      "Obtenemos detallados informes estadísticos utilizados para encontrar tendencias y mejorar la eficiencia de su BPO.",
                  },
                  {
                    icon: <Braces />,
                    title: "Integración personalizada",
                    description:
                      "Desarrollamos conectores con sistemas de gestión de ventas, telefonía y CRM. Si tu empresa utiliza otro sistema, contactanos para integrarlo.",
                  },
                  {
                    icon: <Scale />,
                    title: "Cumplimiento con normativas argentinas",
                    description:
                      "Nos aseguramos de cumplir con las normativas de seguridad y privacidad de la República.",
                  },
                  {
                    icon: <Fingerprint />,
                    title:
                      "Alojamiento local en Argentina para mayor seguridad",
                    description: "Todos tus datos, en nuestro país.",
                  },
                ].map((feature, index) => (
                  <Feature
                    title={feature.title}
                    icon={feature.icon}
                    description={feature.description}
                    key={"feature" + index}
                    index={index}
                  />
                ))}
              </div>
            </section>

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100dvh)] w-full bg-background dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex items-center justify-center'>
              <div className='absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]'></div>
              <div className='container mx-auto'>
                <h2 className='text-3xl sm:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-b dark:from-foreground dark:to-secondary from-black to-neutral-600'>
                  Cómo AuditorIA Optimiza Diferentes Industrias
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full'>
                  <CardContainer>
                    <CardBody className='bg-background relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto lg:min-h-[200px] lg:min-w-full rounded-xl p-4 border flex flex-col gap-2 justify-between min-h-48'>
                      <CardItem>
                        <h3 className='text-2xl font-semibold mb-4'>
                          Contact Centers
                        </h3>
                      </CardItem>
                      <CardItem>
                        <ParagraphP>
                          Identifica áreas de mejora y permite a los
                          supervisores actuar rápidamente ante emociones
                          negativas como frustración.
                        </ParagraphP>
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                  <CardContainer>
                    <CardBody className='bg-background relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto lg:min-h-[200px] lg:min-w-full rounded-xl p-4 border flex flex-col gap-2 justify-between min-h-48'>
                      <CardItem>
                        <h3 className='text-2xl font-semibold mb-4'>
                          Banca y Fintech
                        </h3>
                      </CardItem>
                      <CardItem>
                        <ParagraphP>
                          Garantiza el cumplimiento normativo, detecta fraudes y
                          optimiza la capacitación de los agentes en productos
                          financieros.
                        </ParagraphP>
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                  <CardContainer>
                    <CardBody className='bg-background relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto lg:min-h-[200px] lg:min-w-full rounded-xl p-4 border flex flex-col gap-2 justify-between min-h-48'>
                      <CardItem>
                        <h3 className='text-2xl font-semibold mb-4'>
                          Industria Automotriz
                        </h3>
                      </CardItem>
                      <CardItem>
                        <ParagraphP>
                          Mejora tanto el proceso de ventas como el servicio
                          postventa, identificando las mejores prácticas y
                          resolviendo problemas en tiempo real.
                        </ParagraphP>
                      </CardItem>
                    </CardBody>
                  </CardContainer>

                  <CardContainer>
                    <CardBody className='bg-background relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto lg:min-h-[200px] lg:min-w-full rounded-xl p-4 border flex flex-col gap-2 justify-between min-h-48'>
                      <CardItem>
                        <h3 className='text-2xl font-semibold mb-4'>
                          Sector Seguros
                        </h3>
                      </CardItem>
                      <CardItem>
                        <ParagraphP>
                          Asegura que las ventas cumplan con las normativas
                          legales y mejora la experiencia del cliente al
                          priorizar reclamaciones urgentes y detectar
                          insatisfacción rápidamente.
                        </ParagraphP>
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                </div>
              </div>
            </section>

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-secondary'>
              <div className='container mx-auto'>
                <h2 className='text-3xl sm:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-300 from-black to-neutral-600'>
                  Funcionamiento de AuditorIA: Paso a Paso
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='flex flex-col items-start text-start'>
                    <FileText className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      1. Captura de la Llamada
                    </h3>
                    <ParagraphP>
                      Integración segura con su sistema de grabación existente
                      para capturar cada interacción en tiempo real.
                    </ParagraphP>
                  </div>
                  <div className='flex flex-col items-start text-start'>
                    <Users className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      2. Transcripción y Diariación
                    </h3>
                    <ParagraphP>
                      Transcripción precisa y segmentación de diálogos
                      utilizando algoritmos avanzados de machine learning.
                    </ParagraphP>
                  </div>
                  <div className='flex flex-col items-start text-start'>
                    <BarChart className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      3. Análisis de Sentimiento
                    </h3>
                    <ParagraphP>
                      Detección de emociones y sentimientos en tiempo real
                      utilizando procesamiento de lenguaje natural (NLP).
                    </ParagraphP>
                  </div>
                  <div className='flex flex-col items-start text-start'>
                    <Shield className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      4. Generación de Informes
                    </h3>
                    <ParagraphP>
                      Creación de informes detallados con métricas clave y
                      recomendaciones específicas para mejorar la eficiencia.
                    </ParagraphP>
                  </div>
                </div>
              </div>
            </section>

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative flex items-center justify-center min-h-[calc(100dvh-4rem)] dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.5]'>
              {/* <div className='w-full h-full absolute bg-primary-foreground'>
                <Threads amplitude={1.6} distance={0} enableMouseInteraction />
                <div className='absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-background to-transparent z-20' />
              </div> */}
              <div className='container mx-auto text-center absolute z-30'>
                <h2 className='text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-300 from-black to-neutral-600'>
                  ¿Por Qué Elegirnos?
                </h2>
                <ParagraphP className='text-xl mb-8 max-w-3xl mx-auto'>
                  <LinkPreview
                    url='https://www.linksolution.com.ar/'
                    className='font-bold'
                  >
                    LinkSolution
                  </LinkPreview>
                  , empresa certificada bajo la norma{" "}
                  <LinkPreview
                    url='https://www.linksolution.com.ar/certificacion-iso-90012015-linksolution'
                    className='font-bold'
                  >
                    ISO 9001:2015
                  </LinkPreview>{" "}
                  y reconocida como una de las mejores empresas para trabajar
                  por{" "}
                  <LinkPreview
                    url='https://certificaciones.greatplacetowork.com.ar/linksolution'
                    className='font-bold'
                  >
                    Great Place to Work
                  </LinkPreview>
                  , ofrece soluciones de vanguardia en inteligencia artificial
                  para optimizar procesos empresariales.
                </ParagraphP>
                <ParagraphP className='text-xl mb-8 max-w-3xl mx-auto'>
                  Nuestro equipo de consultores altamente capacitados se
                  mantiene actualizado en las últimas tendencias del sector de
                  IT, contact centers y telemarketing, asegurando soluciones
                  personalizadas que abordan sus desafíos específicos y mejoran
                  la rentabilidad de su negocio.
                </ParagraphP>
                <Button size='lg' asChild>
                  <LinkPreview
                    url='https://www.linksolution.com.ar/contacto'
                    className='font-bold'
                  >
                    Contáctenos
                  </LinkPreview>
                </Button>
              </div>
            </section>
          </main>

          <footer className='py-4 px-4 sm:px-6 lg:px-8 bg-muted text-muted-foreground h-16 mx-auto my-auto text-center items-center justify-center'>
            <ParagraphP>
              &copy; {new Date().getFullYear()} AuditorIA - Todos los derechos
              reservados.
            </ParagraphP>
          </footer>
        </div>
      </ScrollArea>
    </>
  )
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  index: number
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className='opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none' />
      )}
      {index >= 4 && (
        <div className='opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none' />
      )}
      <div className='mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400'>
        {icon}
      </div>
      <div className='text-lg font-bold mb-2 relative z-10 px-10'>
        <div className='absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center' />
        <span className='group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100'>
          {title}
        </span>
      </div>
      <p className='text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10'>
        {description}
      </p>
    </div>
  )
}
