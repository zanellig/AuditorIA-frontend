"use client"
import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { handleCopyToClipboard } from "@/lib/utils"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { CaptionsIcon } from "lucide-react"

import { Form } from "@/components/ui/form"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import ParagraphP from "@/components/typography/paragraphP"
import { SelectField } from "@/components/tables/records-table/audio-processing/select-field"
import { _urlBase } from "@/lib/api/paths"

const formSchema = z.object({
  language: z.enum(["es", "en", "fr"], {
    required_error: "Por favor seleccione un idioma.",
    invalid_type_error: "Por favor seleccione un idioma.",
    message: "Por favor seleccione un idioma.",
  }),
  task_type: z.enum(["transcribe", "align", "diarize", "combine"], {
    required_error: "Por favor seleccione tipo de tarea.",
    invalid_type_error: "Por favor seleccione tipo de tarea.",
    message: "Por favor seleccione tipo de tarea.",
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
      invalid_type_error: "Por favor seleccione un modelo.",
      message: "Por favor seleccione un modelo.",
    }
  ),
  device: z.enum(["cuda", "cpu"], {
    required_error: "Por favor seleccione un dispositivo.",
    invalid_type_error: "Por favor seleccione un dispositivo.",
    message: "Por favor seleccione un dispositivo.",
  }),
})
type FormValues = z.infer<typeof formSchema>

const formOptions = {
  language: [
    { value: "es", label: "Español", disabled: false },
    { value: "en", label: "Inglés", disabled: false },
    {
      value: "fr",
      label:
        "<span>Francés</span> <span class='font-thin'>(próximamente)</span>",
      disabled: true,
    },
  ],
  task_type: [
    { value: "transcribe", label: "Transcribir", disabled: false },
    { value: "align", label: "Alinear transcripción", disabled: true },
    { value: "diarize", label: "Separar canales", disabled: true },
    {
      value: "combine",
      label: "Separar canales y transcribir",
      disabled: false,
    },
  ],
  model: [
    {
      value: "large-v3",
      label:
        "<span class='font-bold'>Large V3</span> <span class='font-thin'>(recomendado)</span>",
      disabled: false,
    },
    { value: "large-v2", label: "Large V2", disabled: false },
    { value: "large-v1", label: "Large V1", disabled: false },
    { value: "large", label: "Large", disabled: true },
    { value: "tiny", label: "Tiny", disabled: true },
    { value: "tiny.en", label: "Tiny EN", disabled: true },
    { value: "base", label: "Base", disabled: true },
    { value: "base.en", label: "Base EN", disabled: true },
    { value: "small", label: "Small", disabled: true },
    { value: "small.en", label: "Small EN", disabled: true },
    { value: "medium", label: "Medium", disabled: true },
    { value: "medium.en", label: "Medium EN", disabled: true },
  ],
  device: [
    { value: "cpu", label: "CPU" },
    { value: "cuda", label: "Neural Processing Unit (CUDA)" },
  ],
}

export default function AudioProcessingTaskStarter({
  row,
  POSTTask,
}: {
  row: any
  POSTTask: (url: string, fileName: string, params: any) => Promise<any>
}) {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })
  useEffect(() => {
    // @ts-expect-error
    form.reset({ language: "", task_type: "", model: "", device: "cuda" })
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    toast({ variant: "success", title: "Se ha enviado la tarea al servidor" })
    document.getElementById("close-sheet")?.click()

    try {
      const res = await POSTTask(
        row.original.URL,
        row.original.GRABACION,
        values
      )
      handleSuccessfulSubmission(res)
    } catch (error: any) {
      handleSubmissionError(error)
    }

    setIsSubmitting(false)
  }

  const handleSuccessfulSubmission = (res: any) => {
    toast({
      variant: "default",
      title: "Se inició la tarea",
      description: res.identifier,
      action: (
        <ToastAction
          altText='Copiar el ID de la tarea enviada'
          onClick={() => copyToClipboard(res.identifier)}
        >
          Copiar ID
        </ToastAction>
      ),
    })
    // @ts-ignore
    // prettier-ignore
    form.reset({ language: "", task_type: "", model: "large-v3", device: "cuda" })
  }

  const handleSubmissionError = (error: any) => {
    const errorMessage = `${error.message} (digest: @${error.digest})`
    toast({
      variant: "destructive",
      title: "Error al enviar la tarea",
      description: errorMessage.toString().slice(0, 50) + "...",
      action: (
        <ToastAction
          className='border border-ring'
          altText='Copiar error al portapapeles'
          onClick={() => copyToClipboard(errorMessage, error.stack)}
        >
          Copiar error
        </ToastAction>
      ),
    })
  }

  const copyToClipboard = (...texts: string[]) => {
    handleCopyToClipboard(texts)
    toast({ variant: "success", title: "Se copió el texto al portapapeles" })
  }

  return (
    <Sheet>
      <Tooltip>
        <SheetTrigger>
          <TooltipTrigger asChild>
            <Button
              id={`button-deploy-transcribe-${row.original?.URL}`}
              variant='ghost'
            >
              <CaptionsIcon size={GLOBAL_ICON_SIZE + 4} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
        </SheetTrigger>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <SelectField<FormValues>
              name='language'
              label='Idioma'
              options={formOptions.language}
              form={form}
            />
            <SelectField<FormValues>
              name='task_type'
              label='Tipo de tarea'
              options={formOptions.task_type}
              form={form}
            />
            <SelectField<FormValues>
              name='model'
              label='Modelo'
              options={formOptions.model}
              form={form}
            />
            <SelectField<FormValues>
              name='device'
              label='Dispositivo'
              options={formOptions.device}
              form={form}
              disabled
            />
            <Button
              type='submit'
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
