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

export default function Login() {
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
          <div className="grid w-full items-center gap-4">
            <form
              action="POST"
              className="grid w-full gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="Ingresá tu usuario"
                  autoComplete="false"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="contraseña"
                  placeholder="Ingresá tu contraseña"
                  type="password"
                />
              </div>
            </form>

            <a
              href="/register"
              className="text-sm text-muted-foreground hover:text-accent-foreground"
            >
              Para registrarte hacé click acá
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancelar</Button>
          <Button>Ingresar</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
