"use client"

import { StatefulButton } from "@/components/stateful-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { featureSuggestionSchema } from "@/lib/forms"
import { submitForm } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Sparkles } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

type FeatureRequestData = z.infer<typeof featureSuggestionSchema>

export default function FeatureRequestForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(featureSuggestionSchema),
  })

  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: submitForm,
    onSuccess: data => {
      toast(data)
      reset()
    },
    onError: error => {
      toast({
        title: "Error",
        description:
          "Hubo un problema al enviar tu recomendación. Por favor, intentá de nuevo.",
        variant: "destructive",
      })
      console.error("Error submitting feature request:", error)
    },
  })

  const onSubmit = (data: FeatureRequestData) => {
    toast({
      title: "Estamos enviando tu sugerencia",
      description: "Podés cerrar esta ventana.",
    })
    mutation.mutate({ data: data, path: "/api/help/feature" })
  }

  return (
    <form
      className='flex flex-col space-y-4 mt-4'
      onSubmit={handleSubmit(data => onSubmit(data as FeatureRequestData))}
    >
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='feature-name'>Nombre completo</Label>
        <Controller
          control={control}
          name='name'
          render={({ field }) => (
            <Input placeholder='Tu nombre' id='feature-name' {...field} />
          )}
        />
        {errors.name && (
          <p className='text-red-600'>{String(errors.name.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='feature-email'>Correo</Label>
        <Controller
          control={control}
          name='email'
          render={({ field }) => (
            <Input placeholder='Tu correo' id='feature-email' {...field} />
          )}
        />
        {errors.email && (
          <p className='text-red-600'>{String(errors.email.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='feature-suggestion'>
          ¿Qué funcionalidad te gustaría que se incluyera?
        </Label>
        <Controller
          control={control}
          name='suggestion'
          render={({ field }) => (
            <Textarea
              placeholder='Describí la funcionalidad que te gustaría ver...'
              id='feature-suggestion'
              {...field}
            />
          )}
        />
        {errors.suggestion && (
          <p className='text-red-600'>{String(errors.suggestion.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label
          htmlFor='feature-benefit'
          className='flex flex-row gap-2 items-center'
        >
          <span>¿Cómo beneficiaría esta funcionalidad a AuditorIA?</span>
          <Sparkles className='animate-sparkle' size={GLOBAL_ICON_SIZE} />
        </Label>
        <Controller
          control={control}
          name='benefit'
          render={({ field }) => (
            <Textarea
              placeholder='Describí cómo esta funcionalidad sería beneficiosa...'
              id='feature-benefit'
              {...field}
            />
          )}
        />
        {errors.benefit && (
          <p className='text-red-600'>{String(errors.benefit.message)}</p>
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
