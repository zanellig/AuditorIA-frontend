"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { handleCopyToClipboard } from "@/lib/utils"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { CaptionsIcon } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import ParagraphP from "@/components/typography/paragraphP"
import { SelectField } from "@/components/tables/records-table/audio-processing/select-field"
import { _urlBase } from "@/lib/api/paths"

import { taskFormOptions, taskFormSchema, type FormValues } from "@/lib/forms"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { createTask } from "@/lib/actions"

export default function EnvioDeTareas({
  className,
  POSTTaskWithFile,
}: {
  className?: string
  POSTTaskWithFile: (file: any, params: Record<string, string>) => Promise<any>
}) {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
  })
  useEffect(() => {
    // @ts-expect-error
    // prettier-ignore
    form.reset({ language: "", task_type: "", model: "", device: "cuda" })
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: FormValues) => {
    if (!values.file) {
      toast({ variant: "destructive", title: "Debe adjuntar un archivo" })
      return
    }
    setIsSubmitting(true)
    toast({ variant: "success", title: "Se ha enviado la tarea al servidor" })
    const file = new FormData()
    file.append("file", values.file as Blob)
    file.append("language", values.language)
    file.append("task_type", values.task_type)
    file.append("model", values.model)
    file.append("device", values.device)
    console.log(file)

    try {
      const res = await fetch("http://10.20.30.30:8000/speech-to-text", {
        headers: {
          "Access-Control-Allow-Origin": "http://10.20.30.30:8000",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, Content-Length, X-Requested-With",
        },
        method: "POST",
        body: file,
      })
      console.log(res)
      handleSuccessfulSubmission(res)
    } catch (error: any) {
      handleSubmissionError(error)
    }

    setIsSubmitting(false)
  }

  const handleSuccessfulSubmission = (res: any) => {
    console.log(res.body)
    if (res.status === 200) {
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
      form.reset({ language: "", task_type: "", model: "", device: "cuda", file: null })
    }
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
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Enviar una tarea manualmente</CardTitle>
        <CardDescription>
          A través de esta página, puede enviar una tarea manualmente. Se
          aceptan únicamente archivos de audio con las siguientes extensiones:
        </CardDescription>
        <div className='flex space-x-2 mt-2'>
          <Badge variant={"outline"}>mp3</Badge>
          <Badge variant={"outline"}>flac</Badge>
          <Badge variant={"outline"}>wma</Badge>
          <Badge variant={"outline"}>aac</Badge>
          <Badge variant={"outline"}>ogg</Badge>
          <Badge variant={"outline"}>wav</Badge>
          <Badge variant={"outline"}>x-wav</Badge>
          <Badge variant={"outline"}>mpeg</Badge>
          <Badge variant={"outline"}>webm</Badge>
        </div>
      </CardHeader>
      <CardContent>
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
            <FormField
              control={form.control}
              name='file'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      name='file'
                      className='mt-2'
                      onChange={(e: any) => {
                        field.onChange(e.target.files[0])
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={isSubmitting}
              variant={"default"}
              className='w-full'
            >
              Iniciar tarea
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
