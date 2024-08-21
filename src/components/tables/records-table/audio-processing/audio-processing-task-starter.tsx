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

import { taskFormOptions, taskFormSchema, type FormValues } from "@/lib/forms"
import { createTask } from "@/lib/actions"

export default function AudioProcessingTaskStarter({ row }: { row: any }) {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
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
    const formData = new FormData()
    const filePath = row.original.URL
    formData.append("language", values.language)
    formData.append("task_type", values.task_type)
    formData.append("model", values.model)
    formData.append("device", values.device)
    const [err, res] = await createTask(formData, {
      fileName: row.original.GRABACION,
      nasUrl: filePath,
    })
    console.log(res, "from audio-processing-task-starter")
    handleSuccessfulSubmission(res)
    handleSubmissionError(err)
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
              options={taskFormOptions.language}
              form={form}
            />
            <SelectField<FormValues>
              name='task_type'
              label='Tipo de tarea'
              options={taskFormOptions.task_type}
              form={form}
            />
            <SelectField<FormValues>
              name='model'
              label='Modelo'
              options={taskFormOptions.model}
              form={form}
            />
            <SelectField<FormValues>
              name='device'
              label='Dispositivo'
              options={taskFormOptions.device}
              form={form}
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
