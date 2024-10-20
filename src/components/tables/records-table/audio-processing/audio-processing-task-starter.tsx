"use client"
import React from "react"
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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { StatefulButton } from "@/components/stateful-button"
import { getHost } from "@/lib/actions"

export default function AudioProcessingTaskStarter({ row }: { row: any }) {
  /**
   * The URL can be null if the audio is not yet on the NAS.
   * This will make the button disabled.
   */
  const url = row.original?.URL
  const id = row.original?.IDLLAMADA

  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
  })

  React.useEffect(() => {
    form.reset({
      language: "es",
      task_type: "transcribe",
      model: "large-v3",
      device: "cuda",
    })
  }, [])

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append("language", values.language)
      formData.append("task_type", values.task_type)
      formData.append("model", values.model)
      formData.append("device", values.device)
      const [err, res] = await fetch(
        `${await getHost()}/api/task?nasUrl=${row.original?.URL}&fileName=${row.original?.GRABACION}`,
        {
          method: "POST",
          body: formData,
        }
      ).then(async res => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        return await res.json()
      })
      if (err) {
        throw new Error(err)
      }
      if (!res) throw new Error("No se pudo obtener el ID de la tarea")
      if (res) return res
    },
    onSuccess: async task => {
      if (!task) {
        throw new Error("No se pudo obtener el ID de la tarea")
      }
      toast({
        variant: "default",
        title: "Se inició la tarea",
        description: task?.identifier || "No se pudo obtener el ID de la tarea",
        action: (
          <ToastAction
            altText='Copiar el ID de la tarea enviada'
            onClick={() => handleCopyToClipboard(task?.identifier || "")}
          >
            Copiar ID
          </ToastAction>
        ),
      })
      form.reset({
        language: "es",
        task_type: "transcribe",
        model: "large-v3",
        device: "cuda",
      })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setIsSubmitting(false)
      document.getElementById("close-sheet")?.click()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
        action: (
          <ToastAction
            className='border border-ring'
            altText='Copiar error al portapapeles'
            onClick={() => handleCopyToClipboard(error.message)}
          >
            Copiar error
          </ToastAction>
        ),
      })
      setIsSubmitting(false)
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  return (
    <Sheet>
      <Tooltip>
        <SheetTrigger disabled={!url}>
          <TooltipTrigger asChild>
            <Button
              id={`button-deploy-transcribe-${url}-${id}`}
              variant='ghost'
              disabled={!url}
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

            <StatefulButton
              type={"submit"}
              variant={"secondary"}
              size={"lg"}
              className='w-full'
              isLoading={isSubmitting}
            >
              Iniciar tarea
            </StatefulButton>
            <SheetClose asChild>
              <button id='close-sheet' style={{ display: "none" }} />
            </SheetClose>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
