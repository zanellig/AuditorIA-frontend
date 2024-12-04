import { CheckCircle, FileText, BarChart, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Logo from "@/components/logo"
import type { Metadata } from "next"
import { LoginButton } from "./_client-buttons/buttons"
import { ModeToggle } from "@/components/navigation/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Novatrix } from "uvcanvas"

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
    url: "https://www.auditoria.linksolution.com.ar",
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
    canonical: "https://www.auditoria.linksolution.com.ar",
  },
}

export default function Home() {
  return (
    <>
      <ScrollArea className='flex  p-0 w-full h-dvh'>
        <div className='min-h-dvh max-w-full bg-background text-foreground'>
          <header className='py-4 px-4 sm:px-6 lg:px-8'>
            <Novatrix />
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
            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8'>
              <div className='container mx-auto text-center'>
                <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6'>
                  Auditar llamados <br />
                  <span className='animate-sparkle'>nunca fue tan fácil</span>
                </h1>
                <p className='text-xl sm:text-2xl mb-8 max-w-4xl mx-auto text-muted-foreground'>
                  Optimice su servicio al cliente con análisis avanzado de
                  llamadas con inteligencia artificial, con total control de sus
                  datos.
                </p>
                <Button size='lg' asChild>
                  <Link
                    href='https://www.linksolution.com.ar/auditoria-de-llamadas-con-ia'
                    prefetch
                  >
                    Solicitar una Demostración
                  </Link>
                </Button>
              </div>
            </section>

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-secondary'>
              <div className='container mx-auto'>
                <h2 className='text-3xl sm:text-4xl font-bold mb-8 text-center'>
                  Características Principales
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {[
                    "Auditoría automática del 100% de las llamadas",
                    "Transcripción y análisis en tiempo real",
                    "Análisis de sentimiento y detección de emociones clave",
                    "Optimización de recursos y reducción de costos operativos",
                    "Validación de ventas y cumplimiento legal",
                    "Estadísticas y reportes automatizados",
                    "Mejora continua y capacitación personalizada",
                    "Cumplimiento con normativas argentinas",
                    "Alojamiento local en Argentina para mayor seguridad",
                  ].map((feature, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      <CheckCircle className='h-6 w-6 text-green-500 flex-shrink-0' />
                      <p className='text-lg'>{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8'>
              <div className='container mx-auto'>
                <h2 className='text-3xl sm:text-4xl font-bold mb-8 text-center'>
                  Cómo AuditorIA Optimiza Diferentes Industrias
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full'>
                  <Card>
                    <CardContent className='p-6'>
                      <h3 className='text-2xl font-semibold mb-4'>
                        Contact Centers
                      </h3>
                      <p>
                        Identifica áreas de mejora y permite a los supervisores
                        actuar rápidamente ante emociones negativas como
                        frustración.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='p-6'>
                      <h3 className='text-2xl font-semibold mb-4'>
                        Banca y Fintech
                      </h3>
                      <p>
                        Garantiza el cumplimiento normativo, detecta fraudes y
                        optimiza la capacitación de los agentes en productos
                        financieros.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='p-6'>
                      <h3 className='text-2xl font-semibold mb-4'>
                        Industria Automotriz
                      </h3>
                      <p>
                        Mejora tanto el proceso de ventas como el servicio
                        postventa, identificando las mejores prácticas y
                        resolviendo problemas en tiempo real.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='p-6'>
                      <h3 className='text-2xl font-semibold mb-4'>
                        Sector Seguros
                      </h3>
                      <p>
                        Asegura que las ventas cumplan con las normativas
                        legales y mejora la experiencia del cliente al priorizar
                        reclamaciones urgentes y detectar insatisfacción
                        rápidamente.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-secondary'>
              <div className='container mx-auto'>
                <h2 className='text-3xl sm:text-4xl font-bold mb-8 text-center'>
                  Funcionamiento de AuditorIA: Paso a Paso
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='flex flex-col items-center text-center'>
                    <FileText className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      1. Captura de la Llamada
                    </h3>
                    <p>
                      Integración segura con su sistema de grabación existente
                      para capturar cada interacción en tiempo real.
                    </p>
                  </div>
                  <div className='flex flex-col items-center text-center'>
                    <Users className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      2. Transcripción y Diariación
                    </h3>
                    <p>
                      Transcripción precisa y segmentación de diálogos
                      utilizando algoritmos avanzados de machine learning.
                    </p>
                  </div>
                  <div className='flex flex-col items-center text-center'>
                    <BarChart className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      3. Análisis de Sentimiento
                    </h3>
                    <p>
                      Detección de emociones y sentimientos en tiempo real
                      utilizando procesamiento de lenguaje natural (NLP).
                    </p>
                  </div>
                  <div className='flex flex-col items-center text-center'>
                    <Shield className='h-16 w-16 mb-4 text-muted-foreground hover:text-primary transition-colors duration-150' />
                    <h3 className='text-2xl font-semibold mb-2'>
                      4. Generación de Informes
                    </h3>
                    <p>
                      Creación de informes detallados con métricas clave y
                      recomendaciones específicas para mejorar la eficiencia.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8'>
              <div className='container mx-auto text-center'>
                <h2 className='text-3xl sm:text-4xl font-bold mb-6'>
                  ¿Por Qué Elegirnos?
                </h2>
                <p className='text-xl mb-8 max-w-3xl mx-auto'>
                  LinkSolution, empresa certificada bajo la norma ISO 9001:2015
                  y reconocida como una de las mejores empresas para trabajar
                  por Great Place to Work, ofrece soluciones de vanguardia en
                  inteligencia artificial para optimizar procesos empresariales.
                </p>
                <p className='text-xl mb-8 max-w-3xl mx-auto'>
                  Nuestro equipo de consultores altamente capacitados se
                  mantiene actualizado en las últimas tendencias del sector de
                  IT, contact centers y telemarketing, asegurando soluciones
                  personalizadas que abordan sus desafíos específicos y mejoran
                  la rentabilidad de su negocio.
                </p>
                <Button size='lg' asChild>
                  <Link
                    href='https://www.linksolution.com.ar/contacto'
                    prefetch
                  >
                    Contáctenos
                  </Link>
                </Button>
              </div>
            </section>
          </main>

          <footer className='py-8 px-4 sm:px-6 lg:px-8 bg-muted text-muted-foreground'>
            <div className='container mx-auto text-center'>
              <p>
                &copy; {new Date().getFullYear()} AuditorIA - Todos los derechos
                reservados.
              </p>
            </div>
          </footer>
        </div>
      </ScrollArea>
    </>
  )
}
