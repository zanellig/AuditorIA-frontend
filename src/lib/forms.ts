import { z } from "zod"
import { ACCEPTED_AUDIO_TYPES } from "./consts"

const AudioFileTypesSchema = z.enum([
  "audio/wav",
  "audio/x-wav",
  "audio/x-wav;codecs=1",
  "audio/mp3",
  "audio/mpeg",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
  "audio/ogg;codecs=vorbis",
  "audio/mpeg;codecs=mp3",
])

/**
 * MIME type validator
 * @param mimeType Pass a string representing a MIME type. Example: "audio/wav"
 * @returns `true` if the MIME type is valid, `false` otherwise
 */
export const validateMimeType = (mimeType: string) => {
  try {
    AudioFileTypesSchema.parse(mimeType)
    return true
  } catch {
    return false
  }
}

export type AudioFileTypes = z.infer<typeof AudioFileTypesSchema>

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const taskFormSchema = z.object({
  campaign_id: z.number().positive().optional(),
  operator_id: z.number().positive().optional(),
  language: z
    .enum(["es", "en", "fr", "de"], {
      required_error: "Por favor seleccione un idioma.",
      invalid_type_error: "Por favor seleccione un idioma.",
      message: "Por favor seleccione un idioma.",
    })
    .default("es"),
  task_type: z
    .enum(["transcribe", "align", "diarize", "combine"], {
      required_error: "Por favor seleccione tipo de tarea.",
      invalid_type_error: "Por favor seleccione tipo de tarea.",
      message: "Por favor seleccione tipo de tarea.",
    })
    .default("transcribe"),
  model: z
    .enum(
      [
        "large-v3",
        "tiny",
        "tiny.en",
        "base",
        "base.en",
        "small",
        "small.en",
        "medium",
        "medium.en",
        "large",
        "large-v1",
        "large-v2",
      ],
      {
        required_error: "Por favor seleccione un modelo.",
        invalid_type_error: "Por favor seleccione un modelo.",
        message: "Por favor seleccione un modelo.",
      }
    )
    .default("large-v3"),
  device: z
    .enum(["cuda", "cpu"], {
      required_error: "Por favor seleccione un dispositivo.",
      invalid_type_error: "Por favor seleccione un dispositivo.",
      message: "Por favor seleccione un dispositivo.",
    })
    .default("cuda"),
  temperature: z
    .number({
      description:
        "Libertad del modelo para la generación de texto. Una menor temperatura otorgará mayor precisión, pero algunas palabras pueden no ser comprendidas correctamente.",
    })
    .min(0.0, { message: "La temperatura debe ser mayor a 0" })
    .max(1.0, { message: "La temperatura debe ser menor a 1" })
    .default(0.0),
  files: z
    .custom<File[]>()
    .refine(files => files?.length > 0 || files?.length !== undefined, {
      message: "Debe seleccionar al menos un archivo de audio.",
    })
    .refine(
      files => {
        if (!files) return true
        for (const file of files) {
          if (file.size > MAX_FILE_SIZE) return false
        }
        return true
      },
      {
        message: `El tamaño máximo de archivo es de 50MB.`,
      }
    )
    .refine(
      files => {
        if (!files) return true
        for (const file of files) {
          if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) return false
        }
        return true
      },
      {
        message: "Solo se admiten archivos de audio (MP3, WAV, OGG, etc.).",
      }
    ),
})

export type FormValues = z.infer<typeof taskFormSchema>

export const taskFormOptions = {
  language: [
    { value: "es", label: "Español", disabled: false },
    { value: "en", label: "Inglés", disabled: false },
    {
      value: "fr",
      label:
        "<span>Francés</span> <span class='font-thin'>(próximamente)</span>",
      disabled: true,
    },
  ],
  task_type: [
    { value: "transcribe", label: "Transcribir", disabled: false },
    { value: "align", label: "Alinear transcripción", disabled: true },
    { value: "diarize", label: "Separar canales", disabled: true },
    {
      value: "combine",
      label: "Separar canales y transcribir",
      disabled: true,
    },
  ],
  model: [
    {
      value: "large-v3",
      label:
        "<span class='font-bold'>Large V3</span> <span class='font-thin'>(recomendado)</span>",
      disabled: false,
    },
    { value: "large-v2", label: "Large V2", disabled: false },
    { value: "large-v1", label: "Large V1", disabled: false },
    { value: "large", label: "Large", disabled: true },
    { value: "medium", label: "Medium", disabled: false },
    { value: "medium.en", label: "Medium EN", disabled: false },
    { value: "small", label: "Small", disabled: false },
    { value: "small.en", label: "Small EN", disabled: false },
    { value: "tiny", label: "Tiny", disabled: false },
    { value: "tiny.en", label: "Tiny EN", disabled: false },
    { value: "base", label: "Base", disabled: true },
    { value: "base.en", label: "Base EN", disabled: true },
  ],
  device: [
    { value: "cpu", label: "CPU", disabled: true },
    { value: "cuda", label: "Neural Processing Unit (CUDA)" },
  ],
  file: [{ value: null, label: "Seleccionar archivo" }],
}

const NAME_VALIDATOR = z
  .string({ message: "Ingrese su nombre completo" })
  .min(1, "El nombre introducido es demasiado corto")
  .max(50, "El nombre introducido es demasiado largo")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Nombre inválido")
  .regex(/\s/, "Ingrese su nombre completo")
  .transform(name => {
    const parts = name.toLowerCase().split(" ")
    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  })

const EMAIL_VALIDATOR = z
  .string({ message: "Introduzca su dirección de correo" })
  .email("Dirección de correo inválida")

export const feedbackSchema = z.object({
  name: NAME_VALIDATOR,
  email: EMAIL_VALIDATOR,
  message: z
    .string()
    .default("El usuario no ha ingresado un mensaje")
    .optional(),
  rating: z
    .number()
    .min(1, "La calificación debe ser mayor a 1")
    .max(5, "La calificación debe estar entre 1 y 5"),
})
export const bugReportSchema = z.object({
  name: NAME_VALIDATOR,
  email: EMAIL_VALIDATOR,
  description: z.string().min(1, "Bug description is required"),
  stepsToReproduce: z.string().min(1, "Steps to reproduce are required"),
  severity: z.enum(["low", "medium", "high"], {
    message: "Severity must be low, medium, or high",
  }),
})
export const featureSuggestionSchema = z.object({
  name: NAME_VALIDATOR,
  email: EMAIL_VALIDATOR.includes("@linksolution.com.ar", {
    message:
      "Por el momento solamente aceptamos sugerencias de usuarios de LinkSolution",
  }),
  suggestion: z.string().min(1, "Feature suggestion is required"),
  benefit: z
    .string()
    .min(1, "Please describe how this feature would be beneficial"),
})

const passwordValidator = z
  .string({ required_error: "Debe ingresar una contraseña" })
  .regex(/[a-z]/, {
    message: "La contraseña debe contener al menos una letra minúscula",
  })
  .regex(/[A-Z]/, {
    message: "La contraseña debe contener al menos una letra mayúscula",
  })
  .regex(/[^a-zA-Z0-9]/, {
    message: "La contraseña debe contener al menos un caracter especial",
  })
  .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  .max(128, { message: "La contraseña debe tener menos de 128 caracteres" })
const usernameValidator = z
  .string({ required_error: "Debe ingresar un nombre de usuario" })
  .min(1, "El nombre de usuario es requerido")
  .max(25, "El nombre de usuario no puede superar los 20 caracteres")
  .trim()
const emailValidator = z
  .string({ required_error: "Ingrese un correo" })
  .regex(
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,125}[a-zA-Z]{2,63}$/,
    { message: "Ingrese un correo válido" }
  )
  .trim()

export const signupFormSchema = z.object({
  username: usernameValidator,
  password: passwordValidator,
  email: emailValidator,
  fullName: NAME_VALIDATOR,
  roleId: z.number().default(1),
})

export const loginFormSchema = z.object({
  username: usernameValidator,
  password: z
    .string({ required_error: "Ingrese su contraseña" })
    .min(1, "Ingrese una contraseña válida"),
  rememberMe: z.boolean().default(false),
})

export const updateUserProfileFormSchema = z.object({
  username: usernameValidator,
  fullName: NAME_VALIDATOR,
  email: emailValidator,
  image: z.union([
    z.string(),
    z.number(),
    z.array(z.string()).readonly(),
    z.undefined(),
  ]),
})
