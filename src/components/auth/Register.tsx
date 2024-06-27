import AuthForm from "@/components/auth/AuthForm"
import { z } from "zod"
import UserSchema from "@/utils/validation/UserSchema"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const { login } = useAuth()
  const props = {
    title: "Registrate a la app",
    description: "",
    schema: UserSchema,
    onSubmit: (data: z.infer<typeof UserSchema> | any) => {
      login(data.username, data.password)
    },
    buttonText: "Registrate",
  }
  return <AuthForm {...props} />
}
