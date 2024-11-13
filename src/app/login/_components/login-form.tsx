"use client"
import * as React from "react"
import { StatefulButton } from "@/components/stateful-button"
import TypographyH3 from "@/components/typography/h3"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { getAuthCookie, isAuthenticated } from "@/lib/auth"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

const loginUser = async (
  credentials: z.infer<typeof loginFormSchema>
): Promise<LoginResponse | string | undefined> => {
  const alreadyLoggedIn = await isAuthenticated()
  if (alreadyLoggedIn) return await getAuthCookie()
  const response = await fetch(`${await getHost()}/api/login`, {
    method: "POST",
    headers: {
      "Origin": window.location.origin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Ha ocurrido un error iniciando sesión")
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
      rememberMe: false,
    },
  })
  const mutation = useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onSuccess: () => {
      // Handle successful login
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente.",
      })
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

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <TypographyH3 className='text-center'>Iniciar sesión</TypographyH3>
            <CardDescription className='text-center'>
              Ingresá a tu cuenta para acceder a la aplicación.
            </CardDescription>
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='rememberMe'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-2 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Recordarme</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className='flex flex-col gap-2'>
            <StatefulButton
              type='submit'
              isLoading={isLoading}
              aria-disabled={isLoading}
              className='w-full'
            >
              Ingresar
            </StatefulButton>
            {/* WIP TODO: Add links to register and forgot password pages */}
            <Link
              href='/signup'
              className='text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4'
              prefetch
            >
              Registrarse
            </Link>
            <Link
              href='/forgot-password'
              className='text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4'
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
