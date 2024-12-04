"use client"
import React from "react"
import { StarIcon } from "@radix-ui/react-icons"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { feedbackSchema } from "@/lib/forms"
import { Slider } from "@/components/ui/slider"
import { submitForm } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { StatefulButton } from "@/components/stateful-button"

type FeedbackData = z.infer<typeof feedbackSchema>

export default function FeedbackForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
  })

  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: submitForm,
    onSuccess: data => {
      toast(data)
    },
    onError: error => {
      toast({
        title: "Error",
        description:
          "Hubo un problema al enviar tu comentario. Por favor, intentá de nuevo.",
        variant: "destructive",
      })
      console.error("Error submitting feedback:", error)
    },
  })

  const onSubmit = (data: FeedbackData) => {
    toast({
      title: "Estamos enviando tus comentarios",
      description: "Podés cerrar esta ventana.",
      variant: "success",
    })
    mutation.mutate({ data: data, path: "/api/help/feedback" })
  }

  return (
    <form
      className='flex flex-col space-y-4 mt-4'
      onSubmit={handleSubmit(data => {
        onSubmit(data as FeedbackData)
      })}
    >
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='feedback-name'>Nombre completo</Label>
        <Controller
          control={control}
          name='name'
          render={({ field }) => (
            <Input placeholder='Tu nombre' id='feedback-name' {...field} />
          )}
        />
        {errors.name && (
          <p className='text-red-600'>{String(errors.name.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='feedback-email'>Correo</Label>
        <Controller
          control={control}
          name='email'
          render={({ field }) => (
            <Input placeholder='Tu correo' id='feedback-email' {...field} />
          )}
        />
        {errors.email && (
          <p className='text-red-600'>{String(errors.email.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-1.5'>
        <Label htmlFor='feedback-message'>Tu mensaje</Label>
        <Controller
          control={control}
          name='message'
          render={({ field }) => (
            <Textarea
              placeholder='Déjanos tus comentarios...'
              id='feedback-message'
              {...field}
            />
          )}
        />
        {errors.message && (
          <p className='text-red-600'>{String(errors.message.message)}</p>
        )}
      </div>
      <div className='grid w-full gap-3'>
        <Label
          htmlFor='feedback-nps'
          className='flex flex-row items-center space-x-2'
        >
          <StarIcon className='h-4 w-4' />
          <span>Califica tu uso de la app</span>
        </Label>
        <Controller
          control={control}
          name='rating'
          render={({ field }) => (
            <FeedbackSlider
              onChange={value => {
                field.onChange(value)
              }}
              id='feedback-nps'
            />
          )}
        />
      </div>
      <div className='flex flex-row items-center space-x-2'>
        <Controller
          control={control}
          name='terms'
          render={({ field }) => (
            <Checkbox
              id='terms-checkbox'
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor='terms-checkbox'>
          Acepto los{" "}
          <a href='#' className='text-blue-400 underline-offset-4 underline'>
            términos y condiciones
          </a>
        </Label>
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
export interface FeedbackSliderProps {
  id: string
  onChange?: (value: number) => void
}

const FeedbackSlider: React.FC<FeedbackSliderProps> = ({ id, onChange }) => {
  const DEFAULT_VALUE = 3
  const [value, setValue] = React.useState<number>(DEFAULT_VALUE)

  const handleValueChange = (newValue: number[]) => {
    const numericValue = newValue[0]
    setValue(numericValue)
    onChange?.(numericValue + 1)
  }

  return (
    <div className='grid w-full gap-3'>
      <Slider
        id={id}
        defaultValue={[DEFAULT_VALUE]}
        max={4}
        step={1}
        onValueChange={handleValueChange}
        value={[value]}
        className=''
      />
      <ul
        className='flex flex-row items-center space-x-2 justify-between'
        aria-hidden='true'
      >
        <li className='text-primary text-sm'>1</li>
        <li className='text-primary text-sm'>2</li>
        <li className='text-primary text-sm'>3</li>
        <li className='text-primary text-sm'>4</li>
        <li className='text-primary text-sm'>5</li>
      </ul>
    </div>
  )
}
