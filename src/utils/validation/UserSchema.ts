import { z } from "zod"

const User = z.object({
  username: z
    .string()
    .min(4, "El usuario es demasiado corto")
    .max(20, "El usuario es demasiado largo"),
  password: z.string().min(3, "Se requiere una contraseña"),
})

export default User
