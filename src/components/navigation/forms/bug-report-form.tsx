"use client"
import * as React from "react"
import { StatefulButton } from "@/components/stateful-button"
import { FileUpload } from "@/components/ui/file-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { bugReportSchema } from "@/lib/forms"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"
import { submitForm } from "@/lib/utils"

const extendedBugReportSchema = bugReportSchema.extend({
  file: z.instanceof(File, { message: "Debe adjuntar un archivo" }),
})
type BugReportData = z.infer<typeof extendedBugReportSchema>

export default function BugReportForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(extendedBugReportSchema),
  })
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: submitForm,
    onSuccess: () => {
      toast({
        title: "Reporte enviado",
        description:
          "Gracias por tu reporte de error. Trabajaremos para resolverlo.",
        variant: "default",
      })
      reset()
    },
    onError: error => {
      toast({
        title: "Error",
        description:
          "Hubo un problema al enviar tu reporte. Por favor, intentá de nuevo.",
        variant: "destructive",
      })
      console.error("Error submitting bug report:", error)
    },
  })

  const onSubmit = (data: BugReportData) => {
    toast({
      title: "Estamos enviando su reporte",
      description: "Podés cerrar esta ventana.",
    })
    mutation.mutate({ data: data, path: "/api/help/bug" })
  }

  return (
    <form
      className='flex flex-col space-y-4 mt-4'
      onSubmit={handleSubmit(data => {
        onSubmit(data as BugReportData)
      })}
    >
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='bug-report-name'>Nombre completo</Label>
        <Controller
          control={control}
          name='name'
          render={({ field }) => (
            <Input placeholder='Tu nombre' id='bug-report-name' {...field} />
          )}
        />
        {errors.name && (
          <p className='text-red-600'>{String(errors.name.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='bug-report-email'>Correo</Label>
        <Controller
          control={control}
          name='email'
          render={({ field }) => (
            <Input placeholder='Tu correo' id='bug-report-email' {...field} />
          )}
        />
        {errors.email && (
          <p className='text-red-600'>{String(errors.email.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='bug-report-description'>Descripción del error</Label>
        <Controller
          control={control}
          name='description'
          render={({ field }) => (
            <Textarea
              placeholder='Describí el error que encontraste...'
              id='bug-report-description'
              {...field}
            />
          )}
        />
        {errors.description && (
          <p className='text-red-600'>{String(errors.description.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='bug-report-steps'>Pasos para reproducir el error</Label>
        <Controller
          control={control}
          name='stepsToReproduce'
          render={({ field }) => (
            <Textarea
              placeholder='Describí los pasos para reproducir el error...'
              id='bug-report-steps'
              {...field}
            />
          )}
        />
        {errors.stepsToReproduce && (
          <p className='text-red-600'>
            {String(errors.stepsToReproduce.message)}
          </p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='bug-report-severity'>Severidad</Label>
        <Controller
          control={control}
          name='severity'
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id='bug-report-severity'>
                <SelectValue placeholder='Selecciona la severidad' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>Baja</SelectItem>
                <SelectItem value='medium'>Media</SelectItem>
                <SelectItem value='high'>Alta</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.severity && (
          <p className='text-red-600'>{String(errors.severity.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='bug-report-file'>
          Adjuntá una captura de pantalla o video
        </Label>
        <Controller
          control={control}
          name='file'
          render={({ field }) => (
            <FileUpload
              acceptInput='image'
              onChange={(files: File[]) => {
                field.onChange(files[0])
              }}
            />
          )}
        />
        {errors.file && (
          <p className='text-red-600'>{String(errors.file.message)}</p>
        )}
      </div>
      <StatefulButton
        type='submit'
        variant='default'
        isLoading={mutation.isPending}
      >
        Enviar
      </StatefulButton>
    </form>
  )
}
