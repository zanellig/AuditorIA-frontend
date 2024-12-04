"use client"
import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { handleCopyToClipboard } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileUpload } from "@/components/ui/file-upload"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { SelectField } from "@/components/tables/records-table/audio-processing/select-field"

import { taskFormOptions, taskFormSchema } from "@/lib/forms"
import { Badge } from "@/components/ui/badge"
import { StatefulButton } from "@/components/stateful-button"
import { ACCEPTED_AUDIO_TYPES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import { getHost } from "@/lib/actions"
import { useUser } from "@/components/context/UserProvider"

type FormValues = z.infer<typeof taskFormSchema>

export default function TaskUploadForm({ className }: { className?: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
  })
  // Get query key from user and time of upload
  const user = useUser()

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!values.file) {
        throw new Error("Debe adjuntar un archivo")
      }
      const formData = new FormData()
      formData.append("file", values.file as File)
      formData.append("language", values.language)
      formData.append("task_type", values.task_type)
      formData.append("model", values.model)
      formData.append("device", values.device)
      const [error, task] = await fetch(`${await getHost()}/api/task`, {
        method: "POST",
        body: formData,
      }).then(async res => {
        if (!res.ok) {
          throw new Error(res.statusText)
        } else {
          return await res.json()
        }
      })
      if (error) {
        throw new Error(error)
      }
      return task
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
        file: [],
      })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (error: Error) => {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error al enviar la tarea",
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
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  return (
    <Card className={cn("mt-4", className)}>
      <CardHeader>
        <CardDescription>
          A través de esta página, puede enviar una tarea manualmente. Se
          aceptan únicamente archivos de audio con las siguientes extensiones:
        </CardDescription>
        <div className='grid grid-cols-5 lg:flex lg:flex-row gap-2 mt-4 items-center'>
          {ACCEPTED_AUDIO_TYPES.map(type => (
            <Badge variant={"outline"} key={type} className='w-fit min-w-12'>
              <span className='text-center w-full'>{type}</span>
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='flex flex-col lg:grid lg:grid-cols-2 gap-2 w-full'>
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
            </div>
            <FormField
              control={form.control}
              name='file'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <div className='flex flex-col'>
                      <FileUpload
                        onChange={(files: File[]) => {
                          field.onChange(files[0])
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <StatefulButton
              type='submit'
              isLoading={
                mutation.isPending ||
                form.formState.isLoading ||
                form.formState.isSubmitting ||
                form.formState.isValidating
              }
            >
              <span>Iniciar tarea</span>
              <Sparkles size={GLOBAL_ICON_SIZE} className='animate-sparkle' />
            </StatefulButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
