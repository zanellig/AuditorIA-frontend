"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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

import { taskFormOptions, taskFormSchema, type FormValues } from "@/lib/forms"
import { Badge } from "./ui/badge"
import { StatefulButton } from "./stateful-button"
import { ACCEPTED_AUDIO_TYPES } from "@/lib/consts"
import { getHost } from "@/lib/actions"

export default function TaskUploadForm({ className }: { className?: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
  })
  const [uploadIdentifier, setUploadIdentifier] = React.useState<string | null>(
    new Date().toISOString()
  )

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
      /**
       * Form works, but API is currently down.
       */
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
        <div className='flex space-x-2 mt-4'>
          {ACCEPTED_AUDIO_TYPES.map(type => (
            <Badge variant={"outline"} key={type}>
              {type}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='flex flex-row space-x-2 w-full'>
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
            </div>
            <div className='flex flex-row space-x-2 w-full'>
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
              isLoading={mutation.isPending}
              className='w-full'
            >
              <span>Iniciar tarea</span>
            </StatefulButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
