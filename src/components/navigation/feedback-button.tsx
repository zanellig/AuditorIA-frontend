import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EnvelopeClosedIcon, StarIcon } from "@radix-ui/react-icons"
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
            <EnvelopeClosedIcon className='h-[1.2rem] w-[1.2rem]' />
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
  const [sliderValue, setSliderValue] = React.useState<number[]>()
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
        <FeedbackSlider
          id={FormTypes.FEEDBACK + "-feedback-nps"}
          shareSliderValue={setSliderValue}
        >
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
type SliderProps = React.ComponentProps<typeof Slider>
interface FeedbackSliderProps extends SliderProps {
  shareSliderValue?: (value: number[]) => void
}
function FeedbackSlider({
  children,
  className,
  shareSliderValue,
  ...props
}: FeedbackSliderProps) {
  "use client"
  const DEFAULT_VALUE = [2]
  const [value, setValue] = React.useState<number[]>(DEFAULT_VALUE)
  React.useEffect(() => {
    if (shareSliderValue) {
      shareSliderValue(value)
    }
  }, [value])
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
  internalEndpoint,
  textAreaPlaceholder,
  formType,
  toastDescriptionText,
  toastVariant = "success",
}: {
  children?: React.ReactNode
  className?: string
  internalEndpoint?: string
  textAreaPlaceholder?: string
  formType?: FormTypes
  toastDescriptionText?: string
  toastVariant?: "default" | "success" | "destructive" | null | undefined
}) {
  "use client"
  const { toast } = useToast()
  const [checked, setChecked] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [textareaValue, setTextareaValue] = React.useState("")

  return (
    <div className={cn("flex flex-col space-y-4 mt-4", className)}>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor={formType + "-name"}>Nombre completo</Label>
        <Input
          placeholder='Tu nombre'
          id={formType + "-name"}
          value={name}
          onChange={e => setName(e.target.value)}
        ></Input>
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor={formType + "-email"}>Correo</Label>
        <Input
          placeholder='Tu correo'
          id={formType + "-email"}
          value={email}
          onChange={e => setEmail(e.target.value)}
        ></Input>
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor={formType + "-textarea"}>Tu mensaje</Label>
        <Textarea
          placeholder={textAreaPlaceholder}
          id={formType + "-textarea"}
          value={textareaValue}
          onChange={e => setTextareaValue(e.target.value)}
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
              <Button variant='default'>Envíanos un correo</Button>
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
          disabled={!checked}
          onClick={() => {
            if (name === "" || email === "" || textareaValue === "") {
              toast({
                title: "Por favor, rellena todos los campos",
                variant: "default",
              })
              return
            }
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
