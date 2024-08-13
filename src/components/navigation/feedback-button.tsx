import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChatBubbleIcon, StarFilledIcon, StarIcon } from "@radix-ui/react-icons"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

export function SendUsFeedbackButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          className={cn(
            "flex bg-popover w-full items-center justify-start space-x-4 overflow-hidden",
            className
          )}
        >
          <div>
            <ChatBubbleIcon className='h-[1.2rem] w-[1.2rem]' />
          </div>
          <div>{children}</div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envianos tus comentarios</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue='feedback'>
          <TabsList className='w-full'>
            <TabsTrigger value='feedback' className='w-full'>
              Feedback
            </TabsTrigger>
            <TabsTrigger value='bug' className='w-full'>
              Reportar error
            </TabsTrigger>
            <TabsTrigger value='feature' className='w-full'>
              Recomendar una funcionalidad
            </TabsTrigger>
          </TabsList>
          <TabsContent value='feedback'>
            <FeedbackForm />
          </TabsContent>
          <TabsContent value='bug'>
            <BugReportForm />
          </TabsContent>
          <TabsContent value='feature'>
            <FeatureRequestForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function FeedbackForm({ className }: { className?: string }) {
  return (
    <FormFactory
      className={className}
      textAreaPlaceholder='Dejanos tus comentarios...'
      formType={FormTypes.FEEDBACK}
      toastDescriptionText='¡Muchas gracias por tu feedback!'
      toastVariant='success'
    >
      <div className='grid w-full gap-3'>
        <Label
          htmlFor={FormTypes.FEEDBACK + "-feedback-nps"}
          className='flex flex-row items-center space-x-2'
        >
          <StarIcon className='h-4 w-4' />
          <span>Califica tu uso de la app</span>
        </Label>
        <FeedbackSlider id={FormTypes.FEEDBACK + "-feedback-nps"}>
          <ul className='flex flex-row items-center space-x-2 justify-between'>
            <li className='text-primary text-sm'>1</li>
            <li className='text-primary text-sm'>2</li>
            <li className='text-primary text-sm'>3</li>
            <li className='text-primary text-sm'>4</li>
            <li className='text-primary text-sm'>5</li>
          </ul>
        </FeedbackSlider>
      </div>
    </FormFactory>
  )
}

type FeedbackSliderProps = React.ComponentProps<typeof Slider>
function FeedbackSlider({
  children,
  className,
  ...props
}: FeedbackSliderProps) {
  "use client"
  const DEFAULT_VALUE = [2]
  const [value, setValue] = React.useState<number[]>(DEFAULT_VALUE)
  // React.useEffect(() => {
  //   console.log(value)
  // }, [value])
  return (
    <div className='grid w-full gap-3'>
      <Slider
        defaultValue={DEFAULT_VALUE}
        max={4}
        step={1}
        onValueChange={values => {
          setValue(values)
        }}
        value={value}
        className={cn("", className)}
      />
      {children}
    </div>
  )
}

function BugReportForm({ className }: { className?: string }) {
  return (
    <FormFactory
      className={className}
      textAreaPlaceholder='Describe el error...'
      formType={FormTypes.BUG}
      toastDescriptionText='Trabajaremos para resolverlo lo antes posible.'
      toastVariant='default'
    >
      <div className='grid w-full gap-1.5'>
        <Label htmlFor={FormTypes.BUG + "-report-file"}>
          Adjunta una captura de pantalla
        </Label>
        <Input type='file' id='bug-report-file'></Input>
      </div>
    </FormFactory>
  )
}

function FeatureRequestForm({ className }: { className?: string }) {
  return (
    <FormFactory
      className={className}
      textAreaPlaceholder='¿Qué funcionalidad te gustaría que se incluyera?'
      formType={FormTypes.FEATURE}
      toastDescriptionText='¡Gracias por compartirnos tu sugerencia!'
      toastVariant='success'
    />
  )
}

enum FormTypes {
  FEEDBACK = "feedback",
  BUG = "bug",
  FEATURE = "feature",
}

function FormFactory({
  children,
  className,
  textAreaPlaceholder,
  formType,
  toastDescriptionText,
  toastVariant = "success",
}: {
  children?: React.ReactNode
  className?: string
  textAreaPlaceholder?: string
  formType?: FormTypes
  toastDescriptionText?: string
  toastVariant?: "default" | "success" | "destructive" | null | undefined
}) {
  "use client"
  const { toast } = useToast()
  const [checked, setChecked] = React.useState(false)

  const HABEAS_DATA_EMAIL_TEXT = ` 
  mailto:auditoria@linksolution.com.ar?cc=soporte@linksolution.com.ar&subject=Solicitud%20de%20acceso%20a%20datos%20personales%20seg%C3%BAn%20Ley%2025.326&body=%3Ch1%3ESOLICITUD%20DE%20ACCESO%20A%20DATOS%20PERSONALES%3C%2Fh1%3E%0A%0A%5BFecha%5D%0A%0A%5BNombre%20de%20la%20empresa%5D%0A%5BDirecci%C3%B3n%20de%20la%20empresa%5D%0A%0AEstimados%20Sres.%3A%0A%0AMi%20nombre%20es%20%5BNombre%20completo%5D%2C%20con%20DNI%20%5Bn%C3%BAmero%5D%2C%20y%20domicilio%20en%20%5Bdirecci%C3%B3n%20completa%5D.%20Me%20dirijo%20a%20ustedes%20para%20ejercer%20mi%20derecho%20de%20acceso%20a%20mis%20datos%20personales%2C%20de%20acuerdo%20con%20lo%20establecido%20en%20la%20Ley%2025.326%20de%20Protecci%C3%B3n%20de%20Datos%20Personales.%0A%0APor%20medio%20de%20la%20presente%2C%20solicito%3A%0A%0A%3Col%3E%0A%3Cli%3E%20Confirmaci%C3%B3n%20sobre%20si%20ustedes%20tienen%20datos%20personales%20m%C3%ADos%20en%20sus%20registros.%20%3C%2Fli%3E%0A%0A%3Cli%3E%20En%20caso%20afirmativo%2C%20que%20me%20proporcionen%20la%20siguiente%20informaci%C3%B3n%3A%0A%3Cul%3E%0A%20%20%20%3Cli%3E%20Qu%C3%A9%20datos%20personales%20m%C3%ADos%20tienen%20almacenados%20%3C%2Fli%3E%0A%20%20%20%3Cli%3E%20Con%20qu%C3%A9%20finalidad%20los%20est%C3%A1n%20utilizando%20%3C%2Fli%3E%0A%20%20%20%3Cli%3E%20De%20d%C3%B3nde%20obtuvieron%20estos%20datos%20%3C%2Fli%3E%0A%20%20%20%3Cli%3E%20A%20qui%C3%A9n%20han%20sido%20o%20podr%C3%ADan%20ser%20transmitidos%20estos%20datos%20%3C%2Fli%3E%0A%3C%2Ful%3E%0A%3C%2Fli%3E%0A%0A%3Cli%3E%20En%20caso%20de%20que%20alguna%20informaci%C3%B3n%20sea%20incorrecta%20o%20est%C3%A9%20desactualizada%2C%20solicito%20su%20correcci%C3%B3n%20o%20actualizaci%C3%B3n.%20%3C%2Fli%3E%0A%0ADe%20acuerdo%20con%20la%20ley%2C%20espero%20recibir%20una%20respuesta%20en%20un%20plazo%20m%C3%A1ximo%20de%2010%20d%C3%ADas%20h%C3%A1biles.%20Si%20necesitan%20alguna%20informaci%C3%B3n%20adicional%20para%20procesar%20esta%20solicitud%2C%20por%20favor%20h%C3%A1ganmelo%20saber%20lo%20antes%20posible.%0A%0ALes%20recuerdo%20que%2C%20seg%C3%BAn%20el%20art%C3%ADculo%2014.3%20de%20la%20Ley%2025.326%2C%20esta%20solicitud%20debe%20ser%20atendida%20de%20forma%20gratuita.%0A%0AAgradezco%20de%20antemano%20su%20colaboraci%C3%B3n%20y%20quedo%20a%20la%20espera%20de%20su%20respuesta.%0A%0AAtentamente%2C%0A%0A%5BFirma%5D%0A%5BNombre%20completo%5D%0A%5BDNI%5D%0A%5BCorreo%20electr%C3%B3nico%20y%2Fo%20n%C3%BAmero%20de%20tel%C3%A9fono%20para%20contacto%5D
  `
  return (
    <div className={cn("flex flex-col space-y-4 mt-4", className)}>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor={formType + "-name"}>Nombre completo</Label>
        <Input placeholder='Tu nombre' id={formType + "-name"}></Input>
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor={formType + "-email"}>Correo</Label>
        <Input placeholder='Tu correo' id={formType + "-email"}></Input>
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor={formType + "-textarea"}>Tu mensaje</Label>
        <Textarea
          placeholder={textAreaPlaceholder}
          id={formType + "-textarea"}
        />
      </div>
      {children}
      <div className='flex flex-row items-center space-x-2'>
        <Checkbox
          id={formType}
          checked={checked}
          onCheckedChange={() => setChecked(!checked)}
        />
        <HoverCard>
          <HoverCardTrigger>
            <Label
              htmlFor={formType}
              className='text-sm cursor-pointer text-muted-foreground hover:text-primary hover:underline'
            >
              Acepto los términos y condiciones
            </Label>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className='text-sm'>
              Los datos enviados se procesarán y se almacenan en nuestros
              sistemas de registro hasta un máximo de 365 días luego de
              enviados.
              <br />
              <br />
              Estos no serán compartidos con ningún tercero ni utilizados para
              fines maliciosos o no autorizados y se rigen bajo la{" "}
              <strong>Ley 25.326 de PROTECCION DE LOS DATOS PERSONALES</strong>
              .
              <br />
              <br />
              La empresa no se hace responsable de los datos que envíe o del uso
              que se le otorgue a los servicios prestados por medio de esta
              aplicación.
              <br />
              <br />
              En caso de requerir acceso a tus datos, podrás solicitar un HABEAS
              DATA a través del siguiente enlace:
              <br />
              <br />
              <Button
                onClick={() => {
                  window.open(HABEAS_DATA_EMAIL_TEXT)
                  navigator.clipboard.writeText(HABEAS_DATA_EMAIL_TEXT)
                }}
                variant='default'
              >
                Envíanos un correo
              </Button>
              <br />
              <br />
            </p>
            <p className='text-muted-foreground'>LinkSolution S.R.L.</p>
          </HoverCardContent>
        </HoverCard>
      </div>
      <DialogClose asChild>
        <Button
          variant='default'
          className='mt-4'
          type='submit'
          disabled={!checked}
          onClick={() => {
            toast({
              title: "Recibimos tus comentarios",
              description: toastDescriptionText,
              variant: toastVariant,
            })
          }}
        >
          Enviar
        </Button>
      </DialogClose>
    </div>
  )
}
