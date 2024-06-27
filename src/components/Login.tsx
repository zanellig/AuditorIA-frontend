import { z } from "zod"
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
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import AltModeToggle from "./AltModeToggle"
import { useAuth } from "@/contexts/AuthContext"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import LoginSchema from "@/utils/validation/LoginSchema"

export default function Login() {
  const { login } = useAuth()
  const form = useForm({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = (data: z.infer<typeof LoginSchema> | any) => {
    login(data.username, data.password)
  }

  const redirectToRegister = () => {
    window.location.href = "/register"
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Accedé a la app</CardTitle>
          <CardDescription>
            Colocá tus credenciales si ya creaste un usuario
          </CardDescription>
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
                <CardFooter className="flex justify-between px-0">
                  <Button
                    variant="outline"
                    onClick={redirectToRegister}
                    className="w-full mr-2"
                  >
                    Registrate
                  </Button>
                  <Button type="submit" className="w-full ml-2">
                    Ingresar
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
