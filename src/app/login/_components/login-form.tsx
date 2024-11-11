"use client"
import * as React from "react"
import { StatefulButton } from "@/components/stateful-button"
import TypographyH3 from "@/components/typography/h3"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginFormSchema } from "@/lib/forms"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { LoginResponse } from "../types/login"
import { getHost } from "@/lib/actions"

const loginUser = async (
  credentials: z.infer<typeof loginFormSchema>
): Promise<LoginResponse> => {
  const response = await fetch(`${await getHost()}/api/login`, {
    method: "POST",
    headers: {
      Origin: window.location.origin,
    },
    body: JSON.stringify(credentials),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error logging in")
  }

  return response.json()
}

export default function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      // Handle successful login
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente.",
      })

      console.log(`${data.token_type} ${data.access_token}`)

      // Redirect to dashboard or home page
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: z.infer<typeof loginFormSchema>) => {
    mutation.mutate(data)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <TypographyH3 className='text-center'>
              Ingresá a tu cuenta
            </TypographyH3>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Ingrese su correo o usuario'
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      placeholder='Contraseña'
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <StatefulButton
              type='submit'
              isLoading={mutation.isPending}
              aria-disabled={mutation.isPending}
              className='w-full'
            >
              Ingresar
            </StatefulButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
