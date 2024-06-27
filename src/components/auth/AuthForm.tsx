import { ZodSchema } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AltModeToggle from "@/components/AltModeToggle"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface AuthFormProps {
  title: string
  description: string
  schema: ZodSchema
  onSubmit: (data: any) => void
  buttonText: string
  redirectTo?: string
  redirectButtonText?: string
}

export default function AuthForm({
  title,
  description,
  schema,
  onSubmit,
  buttonText,
  redirectTo,
  redirectButtonText,
}: AuthFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
  })

  const handleRedirect = () => {
    if (redirectTo) {
      window.location.href = redirectTo
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresá tu usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Ingresá tu contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CardFooter className="flex justify-between px-0 pt-2">
                  {redirectTo && redirectButtonText && (
                    <Button
                      variant="outline"
                      onClick={handleRedirect}
                      className="w-full mr-2"
                    >
                      {redirectButtonText}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={`w-full ${redirectTo ? "ml-2" : ""}`}
                  >
                    {buttonText}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </div>
        </CardContent>
        <CardFooter>
          <AltModeToggle />
        </CardFooter>
      </Card>
    </div>
  )
}
