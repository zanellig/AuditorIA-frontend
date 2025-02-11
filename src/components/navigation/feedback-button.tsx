"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import FeedbackForm from "@/components/forms/feedback-form"
import BugReportForm from "@/components/forms/bug-report-form"
import FeatureRequestForm from "@/components/forms/feature-form"
import { Bug, Heart, Lightbulb, Send } from "lucide-react"
import { DASHBOARD_ICON_CLASSES, IPAD_SIZE_QUERY } from "@/lib/consts"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Separator } from "@/components/ui/separator"

const TRIGGER_ID = "feedback-drawer-open-trigger"

export function SendUsFeedbackButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const isDesktop = useMediaQuery(IPAD_SIZE_QUERY)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // Prevent bubbling to the parent Drawer
  }

  if (isDesktop)
    return (
      <Dialog>
        <DialogTrigger asChild>
          <TriggerButton className={className} id={TRIGGER_ID}>
            {children}
          </TriggerButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envianos tus comentarios</DialogTitle>
            <VisuallyHidden asChild>
              <DialogDescription>
                En esta pantalla, nos podrá enviar comentarios.
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>
          <FeedbackTabs />
        </DialogContent>
      </Dialog>
    )

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <TriggerButton
          id={TRIGGER_ID}
          className={className}
          onClick={handleClick}
        >
          {children}
        </TriggerButton>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='p-0 py-4'>
          <VisuallyHidden asChild>
            <DrawerDescription>
              En esta pantalla, nos podrá enviar comentarios.
            </DrawerDescription>
          </VisuallyHidden>
          <DrawerTitle className='text-center'>
            Envianos tus comentarios
          </DrawerTitle>
          <Separator orientation={"horizontal"} className='w-full mt-2' />
        </DrawerHeader>
        <div className='px-4 pb-4'>
          <FeedbackTabs />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface TriggerButtonProps {
  className?: string
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  id?: string
}

const TriggerButton = React.forwardRef<HTMLButtonElement, TriggerButtonProps>(
  ({ className, children, onClick, id }, ref) => (
    <Button
      id={id || undefined}
      variant='ghost'
      className={cn(
        "flex bg-popover w-fit items-center justify-start space-x-4",
        className
      )}
      onClick={e => {
        e.stopPropagation() // Prevent bubbling to parent
        if (onClick) onClick(e) // Call provided onClick handler
      }}
      ref={ref}
    >
      <div>
        <Send className={DASHBOARD_ICON_CLASSES} />
      </div>
      <div>{children}</div>
    </Button>
  )
)

TriggerButton.displayName = "TriggerButton"

function FeedbackTabs() {
  const isDesktop = useMediaQuery(IPAD_SIZE_QUERY)
  return (
    <Tabs defaultValue='feedback'>
      <TabsList className='w-full'>
        <TabsTrigger value='feedback' className='w-full'>
          {isDesktop ? "Feedback" : <Heart className='text-green-500' />}
        </TabsTrigger>
        <TabsTrigger value='feature' className='w-full'>
          {isDesktop ? (
            "Recomendar una funcionalidad"
          ) : (
            <Lightbulb className='text-yellow-500' />
          )}
        </TabsTrigger>
        <TabsTrigger value='bug' className='w-full'>
          {isDesktop ? "Reportar error" : <Bug className='text-red-500' />}
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
  )
}

enum FormTypes {
  FEEDBACK = "feedback",
  BUG = "bug",
  FEATURE = "feature",
}

/* eslint @typescript-eslint/no-unused-vars: "off"
  --------
  El único motivo por el cual no borro este componente es porque tiene el copy legal, y hasta que no lo relocalice a un componente de la app, no lo voy a borrar.

  The only reason I don't delete this component is because it has the legal disclaimer, and it hasn't been relocated yet.
*/
function FormFactory({
  children,
  className,
  textAreaPlaceholder,
  formType,
  toastDescriptionText,
  toastVariant = "success",
  validationSchema,
}: {
  children?: React.ReactNode
  className?: string
  textAreaPlaceholder?: string
  formType?: FormTypes
  toastDescriptionText?: string
  toastVariant?: "default" | "success" | "destructive" | null | undefined
  validationSchema: z.ZodSchema
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
          <HoverCardContent className='w-96'>
            <article className='text-sm flex flex-col space-y-2'>
              <span>
                Tus datos personales serán procesados y almacenados en nuestros
                sistemas. Garantizamos que estos datos no serán compartidos con
                terceros ni utilizados para fines maliciosos o no autorizados,
                cumpliendo con la{" "}
                <strong>
                  Ley 25.326 de Protección de los Datos Personales
                </strong>
                . Los datos serán eliminados cuando dejen de ser necesarios o
                pertinentes para los fines para los cuales fueron recopilados.
              </span>
              <span>
                Aunque nos esforzamos por proteger tus datos, la empresa no se
                responsabiliza por la información que decidas enviar ni por el
                uso de los servicios ofrecidos a través de esta aplicación.
              </span>
              <span>
                Es responsabilidad del usuario solicitar la actualización y
                especificación de los datos almacenados para asegurar que sean
                precisos. Si deseas acceder a tus datos o ejercer tus derechos
                de protección de datos, puedes solicitarlo a través del
                siguiente enlace:
              </span>
              <Button
                onClick={() =>
                  window.open(
                    "mailto:auditoria@linksolution.com.ar?subject=Solicitud%20de%20acceso%20a%20datos",
                    "_blank"
                  )
                }
                variant='default'
              >
                Contactanos
              </Button>
              <p className='text-muted-foreground'>LinkSolution S.R.L.</p>
            </article>
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
