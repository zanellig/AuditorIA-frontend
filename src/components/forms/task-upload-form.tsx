"use client"
import * as React from "react"
import type { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { taskFormOptions, taskFormSchema } from "@/lib/forms"
import { Sparkles, X, Volume2, Music, AudioLines } from "lucide-react"
import { ACCEPTED_AUDIO_TYPES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

import { SelectField } from "@/components/tables/records-table/audio-processing/select-field"

import { StatefulButton } from "@/components/stateful-button"
import { useUser } from "@/components/context/UserProvider"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

type FormValues = z.infer<typeof taskFormSchema>

export default function TaskUploadForm({ className }: { className?: string }) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [playingAudio, setPlayingAudio] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const audioRefs = React.useRef<Record<string, HTMLAudioElement | null>>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const filesArray = Array.from(files)
      setSelectedFiles(prev => [...prev, ...filesArray])

      // Create a new FileList-like object for react-hook-form
      const dataTransfer = new DataTransfer()
      ;[...selectedFiles, ...filesArray].forEach(file =>
        dataTransfer.items.add(file)
      )
      form.setValue("files", dataTransfer.files, {
        shouldValidate: true,
      })
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)

      // Create a new FileList-like object for react-hook-form
      if (newFiles.length === 0) {
        form.setValue("files", undefined, { shouldValidate: true })
      } else {
        const dataTransfer = new DataTransfer()
        newFiles.forEach(file => dataTransfer.items.add(file))
        form.setValue("files", dataTransfer.files, { shouldValidate: true })
      }

      return newFiles
    })
  }

  const getAudioFileIcon = (file: File) => {
    const fileType = file.type

    if (fileType === "audio/mpeg" || fileType === "audio/mp3") {
      return <Music className='h-6 w-6 text-purple-500' />
    } else if (fileType === "audio/wav") {
      return <AudioLines className='h-6 w-6 text-blue-500' />
    } else {
      return <Volume2 className='h-6 w-6 text-green-500' />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const togglePlayPause = (fileUrl: string, index: number) => {
    const audioElement = audioRefs.current[index]

    if (playingAudio === fileUrl) {
      audioElement?.pause()
      setPlayingAudio(null)
    } else {
      // Pause any currently playing audio
      if (playingAudio) {
        const currentIndex = selectedFiles.findIndex(
          file => URL.createObjectURL(file) === playingAudio
        )
        if (currentIndex !== -1) {
          audioRefs.current[currentIndex]?.pause()
        }
      }

      audioElement?.play()
      setPlayingAudio(fileUrl)
    }
  }

  const resetForm = () => {
    form.reset()
    setSelectedFiles([])
    setPlayingAudio(null)
  }

  const { toast } = useToast()

  const user = useUser()

  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      language: "es",
      task_type: "transcribe",
      model: "large-v3",
      device: "cuda",
      temperature: 1,
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const files = values.files

      console.log("Files attached", files)

      if (!files || files?.length === 0) {
        throw new Error("Debe adjuntar un archivo")
      }

      const formData = new FormData()
      for (const file of files) {
        formData.append(`data[${file.name}]`, file)
      }
      formData.append("language", values.language)
      formData.append("task_type", values.task_type)
      formData.append("model", values.model)
      formData.append("device", values.device)
      formData.append("temperature", values.temperature.toString())
      const res = await fetch(`http://10.20.62.96:5678/webhook/transcribe`, {
        method: "POST",
        body: formData,
        headers: {
          "x-username": user?.username ?? "",
          "x-campaign-id": values.campaign_id?.toString() ?? "",
          "x-operator-id": values.operator_id?.toString() ?? "",
        },
      })
      if (!res.ok) {
        throw new Error(res.statusText)
      }

      return {} as any
    },
    onSuccess: async task => {
      if (!task) {
        throw new Error("No se pudo obtener el ID de la tarea")
      }

      toast({
        variant: "default",
        title: "Tarea enviada",
      })

      resetForm()

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
        exact: false,
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error al enviar la tarea",
        description: error.message,
      })
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || !isNaN(Number(value))) {
      if (Number(value) > 0) {
        form.setValue(e.target.name as any, Number(value))
      }
    }
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
              name='temperature'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Temperatura</FormLabel>
                    <span className='text-sm text-muted-foreground'>
                      {field.value}
                    </span>
                  </div>
                  <FormControl>
                    <div className='flex flex-col gap-2'>
                      <Slider
                        value={[field.value]}
                        defaultValue={[field.value]}
                        max={1}
                        min={0}
                        step={0.01}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className='text-sm text-muted-foreground'>
                    Libertad del modelo para la generación de texto. Una menor
                    temperatura otorgará mayor precisión, pero algunas palabras
                    pueden no ser comprendidas correctamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col lg:grid lg:grid-cols-2 gap-2 w-full'>
              <FormField
                control={form.control}
                name='campaign_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ID de la campaña{" "}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={handleNumberInputChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='operator_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ID del operador{" "}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={handleNumberInputChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='files'
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Adjuntar archivos</FormLabel>
                  <FormControl>
                    <div className='flex flex-col gap-2'>
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors",
                          form.formState.errors.files
                            ? "border-destructive"
                            : "border-muted-foreground/25"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onDragEnter={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          e.currentTarget.classList.add("border-primary")
                        }}
                        onDragLeave={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          e.currentTarget.classList.remove("border-primary")
                        }}
                        onDrop={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          e.currentTarget.classList.remove("border-primary")

                          if (
                            e.dataTransfer.files &&
                            e.dataTransfer.files?.length > 0
                          ) {
                            const filesArray = Array.from(e.dataTransfer.files)
                            setSelectedFiles(prev => [...prev, ...filesArray])

                            // Create a new FileList-like object for react-hook-form
                            const dataTransfer = new DataTransfer()
                            ;[...selectedFiles, ...filesArray].forEach(file =>
                              dataTransfer.items.add(file)
                            )
                            form.setValue("files", dataTransfer.files, {
                              shouldValidate: true,
                            })
                          }
                        }}
                      >
                        <Volume2 className='h-10 w-10 text-muted-foreground mb-2' />
                        <p className='text-sm text-muted-foreground mb-1'>
                          Arrastra y suelta archivos aquí o haz click para
                          buscar
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Soporta MP3, WAV, OGG, AAC, FLAC, M4A, WEBM (Max 50MB)
                        </p>
                        <Input
                          type='file'
                          ref={fileInputRef}
                          multiple
                          className='hidden'
                          onChange={handleFileChange}
                          accept={ACCEPTED_AUDIO_TYPES.join(",")}
                        />
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className='mt-4 space-y-2'>
                          <p className='text-sm font-medium'>
                            Archivos adjuntos ({selectedFiles.length})
                          </p>
                          <div className='border rounded-md divide-y'>
                            {selectedFiles.map((file, index) => {
                              const fileUrl = URL.createObjectURL(file)
                              return (
                                <div
                                  key={index}
                                  className='flex items-center justify-between p-3'
                                >
                                  <div className='flex items-center gap-3'>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      className='h-10 w-10 rounded-full'
                                      onClick={() =>
                                        togglePlayPause(fileUrl, index)
                                      }
                                    >
                                      {playingAudio === fileUrl ? (
                                        <span className='h-3 w-3 bg-primary rounded-sm' />
                                      ) : (
                                        getAudioFileIcon(file)
                                      )}
                                    </Button>
                                    <audio
                                      ref={el =>
                                        (audioRefs.current[index] = el)
                                      }
                                      src={fileUrl}
                                      onEnded={() => setPlayingAudio(null)}
                                      onLoadedMetadata={e => {
                                        // You can access duration here if needed
                                        const target =
                                          e.target as HTMLAudioElement
                                        console.log(
                                          `Duration: ${target.duration}s`
                                        )
                                      }}
                                    />
                                    <div className='flex flex-col'>
                                      <span className='text-sm font-medium truncate max-w-[200px]'>
                                        {file.name}
                                      </span>
                                      <span className='text-xs text-muted-foreground'>
                                        {formatFileSize(file.size)}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => removeFile(index)}
                                  >
                                    <X className='h-4 w-4' />
                                    <span className='sr-only'>
                                      Eliminar archivo
                                    </span>
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className='text-sm text-muted-foreground'>
              Los campos con <span className='text-destructive'>*</span> son
              opcionales. <br />
              Si se proporcionan los mismos, se utilizarán para vincular la
              tarea con un operador o campaña específica si existen.
            </span>
            <StatefulButton
              type='submit'
              isLoading={
                mutation.isPending ||
                form.formState.isLoading ||
                form.formState.isSubmitting ||
                form.formState.isValidating
              }
            >
              <Sparkles size={GLOBAL_ICON_SIZE} className='animate-sparkle' />
              <span>Iniciar tarea</span>
            </StatefulButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
