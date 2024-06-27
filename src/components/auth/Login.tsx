import AuthForm from "@/components/auth/AuthForm"
import { z } from "zod"
import UserSchema from "@/utils/validation/UserSchema"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const { login } = useAuth()

  const handleLogin = (data: z.infer<typeof UserSchema>) => {
    const isAuthenticated = login(data.username, data.password)
    console.log("Login component, isAuthenticated:", isAuthenticated)
    if (isAuthenticated) {
      window.location.href = "/"
    }
  }

  const props = {
    title: "Accedé a la app",
    description: "Colocá tus credenciales si ya creaste un usuario",
    schema: UserSchema,
    onSubmit: handleLogin,
    buttonText: "Acceder",
    redirectTo: "/register",
    redirectButtonText: "Registrarse",
  }

  return <AuthForm {...props} />
}
