import { z } from "zod"

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
  } catch (err) {
    return false
  }
}

export type AudioFileTypes = z.infer<typeof AudioFileTypesSchema>

export const taskFormSchema = z.object({
  language: z.enum(["es", "en", "fr", "de"], {
    required_error: "Por favor seleccione un idioma.",
    invalid_type_error: "Por favor seleccione un idioma.",
    message: "Por favor seleccione un idioma.",
  }),
  task_type: z.enum(["transcribe", "align", "diarize", "combine"], {
    required_error: "Por favor seleccione tipo de tarea.",
    invalid_type_error: "Por favor seleccione tipo de tarea.",
    message: "Por favor seleccione tipo de tarea.",
  }),
  model: z.enum(
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
  ),
  device: z.enum(["cuda", "cpu"], {
    required_error: "Por favor seleccione un dispositivo.",
    invalid_type_error: "Por favor seleccione un dispositivo.",
    message: "Por favor seleccione un dispositivo.",
  }),
  file: z.custom<File | Blob>().optional(),
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
      disabled: false,
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
    // { value: "large", label: "Large", disabled: true },
    // { value: "tiny", label: "Tiny", disabled: true },
    // { value: "tiny.en", label: "Tiny EN", disabled: true },
    // { value: "base", label: "Base", disabled: true },
    // { value: "base.en", label: "Base EN", disabled: true },
    // { value: "small", label: "Small", disabled: true },
    // { value: "small.en", label: "Small EN", disabled: true },
    // { value: "medium", label: "Medium", disabled: true },
    // { value: "medium.en", label: "Medium EN", disabled: true },
  ],
  device: [
    { value: "cpu", label: "CPU", disabled: true },
    { value: "cuda", label: "Neural Processing Unit (CUDA)" },
  ],
  file: [{ value: null, label: "Seleccionar archivo" }],
}

export const feedbackFormSchema = z.object({
  name: z
    .string({
      required_error: "Por favor, introduce tu nombre.",
      invalid_type_error: "Por favor, introduce un nombre válido.",
    })
    .min(1)
    .max(50)
    // name only includes letters and spaces
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    // name has to include al least one space character to be a valid full name (e.g. "John Doe")
    .refine(value => value.includes(" "), {
      message: "Por favor, introduce tu nombre completo.",
      path: ["name"],
    }),
  email: z.string().email(),
  message: z.string().min(1).max(1000),
  rating: z.number().min(1).max(5),
  has_accepted_terms: z.boolean(),
})
