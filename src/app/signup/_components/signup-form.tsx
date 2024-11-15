"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signupFormSchema } from "@/lib/forms"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import Logo from "@/components/logo"
import SubtitleH2 from "@/components/typography/subtitleH2"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { getHost } from "@/lib/actions"
import { Loader2 } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import ParagraphP from "@/components/typography/paragraphP"
import { BackgroundLines } from "@/components/ui/background-lines"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/context/UserProvider"

const signupUser = async (
  credentials: z.infer<typeof signupFormSchema>
): Promise<string | undefined> => {
  const response = await fetch(`${await getHost()}/api/signup`, {
    method: "POST",
    headers: {
      "Origin": window.location.origin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(
      error.message || "Ha ocurrido un error registrando tu cuenta"
    )
  }

  return response.json()
}

export default function SignupForm() {
  const signupUserCallback = React.useCallback(signupUser, [])

  const [step, setStep] = React.useState(0)

  const { refreshUser, refreshAvatar } = useUser()

  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    mode: "onChange",
    defaultValues: {
      roleId: 1,
    },
  })

  const mutation = useMutation({
    mutationKey: ["signup"],
    mutationFn: signupUserCallback,
    onSuccess: async () => {
      await Promise.allSettled([refreshUser(), refreshAvatar()])
      toast({
        title: `¡Bienvenido!`,
        description: "Te has registrado existosamente.",
      })
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

  const onSubmit = (values: z.infer<typeof signupFormSchema>) => {
    mutation.mutate(values)
  }

  const totalSteps = 3

  const nextStep = async () => {
    const fieldsToValidate =
      step === 0 ? ["fullName", "email"] : ["username", "password"]
    // @ts-expect-error ts(2345) is a false positive
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setStep(prev => Math.min(prev + 1, totalSteps - 1))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0))
  }
  return (
    <div className='flex flex-col items-center justify-center min-h-screen space-y-4'>
      <Link
        href='/'
        prefetch
        className='text-muted-foreground hover:text-foreground transition-colors duration-300 cursor-pointer'
      >
        <div className='flex gap-4 items-center justify-center'>
          <Logo width={36} height={36} />
          <SubtitleH2>AuditorIA</SubtitleH2>
        </div>
      </Link>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='mb-8'>
            <div className='flex justify-between mb-2'>
              <AnimatePresence>
                {[...Array(totalSteps - 1)].map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < step
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    initial={false}
                    animate={{
                      scale: index === step ? 1.2 : 1,
                      transition: { duration: 0.3 },
                    }}
                  >
                    {index + 1}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className='relative w-full h-2 bg-secondary rounded-full overflow-hidden'>
              <AnimatePresence>
                <motion.div
                  className='absolute top-0 left-0 h-full bg-primary'
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${(step / (totalSteps - 2)) * 50}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <div className='relative h-[300px] overflow-hidden'>
                <div
                  className={`absolute w-full transition-all duration-300 ease-in-out transform ${
                    step === 0
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-full opacity-0"
                  }`}
                >
                  <div className='space-y-4'>
                    <CardTitle>Información personal</CardTitle>
                    <FormField
                      control={form.control}
                      name='fullName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tu nombre</FormLabel>
                          <FormControl>
                            <Input placeholder='David Rodriguez' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='david.rodriguez@tu-empresa.com.ar'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div
                  className={`absolute w-full transition-all duration-300 ease-in-out transform ${
                    step === 1
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-full opacity-0"
                  }`}
                >
                  <div className='space-y-4'>
                    <CardTitle>Seguridad</CardTitle>
                    <FormField
                      control={form.control}
                      name='username'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de usuario</FormLabel>
                          <FormControl>
                            <Input placeholder='david.rodriguez' {...field} />
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
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type='password' {...field} />
                          </FormControl>
                          <FormDescription>
                            Debe contener al menos 8 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div
                  className={`absolute w-full transition-all duration-300 ease-in-out transform ${
                    step === 2
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-full opacity-0"
                  }`}
                >
                  <div className='flex justify-center items-center gap-2'>
                    {mutation.isPending && (
                      <>
                        <Loader2
                          size={GLOBAL_ICON_SIZE}
                          className='animate-spin text-center'
                        />
                        <span>Verificando tu cuenta</span>
                      </>
                    )}
                    {mutation.isSuccess && (
                      <div className={cn("h-[300px] w-full relative")}>
                        <BackgroundLines svgOptions={{ duration: 1 }}>
                          <div className='absolute w-full h-full top-0 left-0 flex flex-col items-center justify-center gap-4'>
                            <ParagraphP className='text-center'>
                              ¡Creamos tu cuenta{" "}
                              <span className='animate-sparkle'>
                                existosamente
                              </span>
                              !<br />
                              Te estamos redireccionando a la aplicación...
                            </ParagraphP>
                          </div>
                        </BackgroundLines>
                      </div>
                    )}
                    {mutation.isError && (
                      <div className='flex flex-col gap-4 justify-center items-center'>
                        <ParagraphP>
                          Ha ocurrido un error al registrar tu cuenta...
                        </ParagraphP>
                        <ParagraphP className='text-muted-foreground'>
                          {mutation.error.message}
                        </ParagraphP>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='flex justify-between pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={prevStep}
                  disabled={step === 0}
                  className='w-24'
                >
                  Atrás
                </Button>

                {step < totalSteps - 2 ? (
                  <Button type='button' onClick={nextStep} className='w-24'>
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type='submit'
                    onClick={nextStep}
                    className={cn("w-24")}
                    disabled={mutation.isPending}
                    aria-disabled={mutation.isPending}
                  >
                    {mutation.isError ? "Reintentar" : "Registrarse"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
