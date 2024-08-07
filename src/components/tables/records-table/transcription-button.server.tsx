"use client"
import { useState } from "react"
import type { SyntheticEvent } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { CaptionsIcon } from "lucide-react"
import ParagraphP from "@/components/typography/paragraphP"

import type { Row } from "@tanstack/react-table"
import type { Recording } from "@/lib/types"

import { createTask } from "@/lib/actions"
import { _transcriptPath, _urlBase } from "@/lib/api/paths"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { handleCopyToClipboard } from "@/lib/utils"

export async function POSTTask(
  url: string,
  fileName: Recording["GRABACION"],
  params: any
) {
  const response = await createTask(
    _urlBase,
    "/speech-to-text",
    url,
    params,
    null,
    false,
    fileName
  )
  return response
}

export default function TranscriptionButton({ row }: { row: Row<Recording> }) {
  const { toast } = useToast()

  const formSchema = z.object({
    language: z.enum(["es", "en"], {
      required_error: "Por favor seleccione un idioma.",
      invalid_type_error: "",
    }),
    task_type: z.enum(["transcribe", "align", "diarize", "combine"], {
      required_error: "Por favor seleccione tipo de tarea.",
      invalid_type_error: "",
    }),
    model: z.enum(
      [
        "large-v3",
        "tiny",
        "tiny.en",
        "base",
        "base.en",
        "small",
        "small.en",
        "medium",
        "medium.en",
        "large",
        "large-v1",
        "large-v2",
      ],
      {
        required_error: "Por favor seleccione un modelo.",
        invalid_type_error: "",
      }
    ),
    device: z.enum(["cuda", "cpu"], {
      required_error: "Por favor seleccione un dispositivo.",
      invalid_type_error: "",
    }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: z.infer<typeof formSchema>, event: any) => {
    setIsSubmitting(true)
    toast({
      variant: "success",
      title: "Se ha enviado la tarea al servidor",
    })
    document.getElementById("close-sheet")?.click() // Manually close the sheet
    try {
      const res = await POSTTask(
        row.original.URL,
        row.original.GRABACION,
        values
      )

      toast({
        variant: "default",
        title: "Se inició la tarea",
        description: res.identifier,
        action: (
          <ToastAction
            altText='Copiar el ID de la tarea enviada'
            onClick={() => {
              handleCopyToClipboard([res.identifier])
              toast({
                variant: "success",
                title: "Se copió el ID al portapapeles",
              })
            }}
          >
            Copiar ID
          </ToastAction>
        ),
      })

      // only reset on success, for UX purposes. ignore assignment error. does't trigger validation
      // @ts-expect-error
      form.reset({ language: "", task_type: "" })
      setIsSubmitting(false)
    } catch (error: any) {
      const ERROR_MESSAGE = `${error.message} (digest: @${error.digest})`

      toast({
        variant: "destructive",
        title: "Error al enviar la tarea",
        description: ERROR_MESSAGE,
        action: (
          <ToastAction
            className='border border-ring'
            altText='Copiar error al portapapeles'
            onClick={() => {
              handleCopyToClipboard([ERROR_MESSAGE, error.stack])
            }}
          >
            Copiar error
          </ToastAction>
        ),
      })
      setIsSubmitting(false)
    }
  }

  form.setValue("device", formSchema.shape.device._def.values[0], {
    shouldDirty: false,
  })
  form.setValue("model", formSchema.shape.model._def.values[0], {
    shouldDirty: false,
  })

  const onError = (errors: any, event: any) => {
    toast({
      variant: "destructive",
      title: "Por favor revise los campos ingresados",
    })
  }

  const handleCloseClick = (e: SyntheticEvent) => {
    if (isSubmitting) {
      e.stopPropagation()
    }
  }

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button
              id={`button-deploy-transcribe-${row.original?.URL}`}
              variant='ghost'
            >
              <CaptionsIcon size={GLOBAL_ICON_SIZE + 4} strokeWidth={2} />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <ParagraphP>Transcribir audio</ParagraphP>
        </TooltipContent>
      </Tooltip>
      <SheetContent side={"left"} className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>
            <div className='flex flex-row text-start items-center space-x-2'>
              <CaptionsIcon /> <span>Opciones de transcripción</span>
            </div>
          </SheetTitle>
          <SheetDescription>
            Si conoce estas opciones, puede seleccionar los parámetros que le
            parezcan convenientes. En caso de no saber lo que significan estas
            casillas, puede dejarlas vacías.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className='space-y-8'
          >
            <FormField
              control={form.control}
              name='language'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Seleccione el idioma' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='es'>Español</SelectItem>
                          <SelectItem value='en'>Inglés</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='task_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de tarea</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Seleccione el tipo de tarea' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='transcribe'>
                            Transcribir
                          </SelectItem>
                          <SelectItem value='align'>
                            Alinear transcripción
                          </SelectItem>
                          <SelectItem value='diarize'>
                            Separar canales
                          </SelectItem>
                          <SelectItem value='combine'>
                            Separar canales y transcribir
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='model'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Seleccione el modelo de IA' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='large-v3'>
                            <span className='font-bold'>Large V3 </span>
                            <span className='font-thin'> (recomendado)</span>
                          </SelectItem>
                          <SelectItem value='tiny'>Tiny</SelectItem>
                          <SelectItem value='tiny.en'>Tiny EN</SelectItem>
                          <SelectItem value='base'>Base</SelectItem>
                          <SelectItem value='base.en'>Base EN</SelectItem>
                          <SelectItem value='small'>Small</SelectItem>
                          <SelectItem value='small.en'>Small EN</SelectItem>
                          <SelectItem value='medium'>Medium</SelectItem>
                          <SelectItem value='medium.en'>Medium EN</SelectItem>
                          <SelectItem value='large'>Large</SelectItem>
                          <SelectItem value='large-v1'>Large V1</SelectItem>
                          <SelectItem value='large-v2'>Large V2</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='device'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispositivo</FormLabel>
                  <FormControl>
                    <Select value={field.value}>
                      <SelectTrigger className='w-full' disabled>
                        <SelectValue placeholder='Seleccione el dispositivo' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='cpu'>CPU</SelectItem>
                          <SelectItem value='cuda'>GPU</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              onClick={handleCloseClick}
              disabled={isSubmitting}
              variant={"secondary"}
              className='w-full'
            >
              Iniciar tarea
            </Button>
            <SheetClose asChild>
              <button id='close-sheet' style={{ display: "none" }} />
            </SheetClose>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
