import { z } from "zod"

export const SupportedLocales = z.enum(["en", "es"])
export enum TableSupportedDataTypes {
  Tasks = "tasks",
  Recordings = "recordings",
}
export interface ServerStatusResponse {
  variant: ServerStatusBadgeVariant
  text: string
}
export enum ServerStatusBadgeVariant {
  OK = "success",
  Warning = "warning",
  Error = "error",
  Unknown = "default",
}

export enum AnalysisMessage {
  Queued = "queued for analyze",
}
export interface Analysis {
  message: AnalysisMessage
}

export const Status = z.enum([
  "completed",
  "processing",
  "failed",
  "analyzed",
  "pending",
  "analyzing",
])
export type Status = z.infer<typeof Status>

export const taskSchema = z.object({
  identifier: z.string(),
  status: Status,
  task_type: z.string(),
  file_name: z.string(),
  language: z.enum(["en", "es"]),
  audio_duration: z.number(),
  created_at: z.date(),
})
export type Task = z.infer<typeof taskSchema>
export type Tasks = Task[]

export interface TaskPOSTResponse {
  identifier: TaskUUID
  message: string
}

export const recordingSchema = z.object({
  id: z.number(),
  fecha: z.number(),
  IDLLAMADA: z.number().or(z.string()),
  IDAPLICACION: z.number(),
  USUARIO: z.number(),
  ANI_TELEFONO: z.number(),
  GRABACION: z.string(),
  DIRECCION: z.string(),
  INICIO: z.string({
    description:
      "API returns a string type formatted as an ISO string. Can be converted to a Date.",
  }),
  FIN: z.string(),
  SECTOT: z.number(),
  URL: z.string(),
})
export type Recording = z.infer<typeof recordingSchema>
export type Recordings = Recording[]
export interface RecordingsAPIResponse {
  records: Recordings
}

export enum Method {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
}
export interface FetchOptions extends RequestInit {
  headers: Headers | Record<string, string>
  method: Method
  body?: Record<string, string> | FormData | null
  next?: NextFetchRequestConfig
  cache?: RequestCache
}

export const emotionProbasSchema = z.object({
  joy: z.number(),
  fear: z.number(),
  anger: z.number(),
  others: z.number(),
  disgust: z.number(),
  sadness: z.number(),
  surprise: z.number(),
})
export type EmotionProbas = z.infer<typeof emotionProbasSchema>
export const sentimentProbasSchema = z.object({
  NEG: z.number(),
  NEU: z.number(),
  POS: z.number(),
})
export type SentimentProbas = z.infer<typeof sentimentProbasSchema>
export const hateSpeechProbasSchema = z.object({
  hateful: z.number(),
  targeted: z.number(),
  aggressive: z.number(),
})
export type HateSpeechProbas = z.infer<typeof hateSpeechProbasSchema>
export const segmentAnalysisSchema = z.object({
  emotion: z.string(),
  sentiment: z.enum(["NEG", "NEU", "POS"]),
  hate_speech: z.string(),
  emotion_probas: emotionProbasSchema,
  sentiment_probas: sentimentProbasSchema,
  hate_speech_probas: hateSpeechProbasSchema,
  is_hate_speech: z.boolean(),
})
export type SegmentAnalysisProperties = z.infer<typeof segmentAnalysisSchema>

export const segmentSchema = z.object({
  end: z.number(),
  text: z.string(),
  start: z.number(),
  speaker: z.string(),
  analysis: z.optional(segmentAnalysisSchema),
})
export type Segment = z.infer<typeof segmentSchema>

export const transcriptionTypeSchema = z.object({
  status: Status,
  result: z.object({
    segments: z.array(segmentSchema),
  }),
  error: z.string().nullable(),
  metadata: z.object({
    audio_duration: z.number().nullable(),
    duration: z.number(),
    file_name: z.string(),
    language: SupportedLocales,
    task_params: z.object({
      task: z.string(),
      model: z.string(),
      device: z.string(),
      threads: z.number(),
      language: z.string(),
      batch_size: z.number(),
      compute_type: z.string(),
      device_index: z.number(),
      max_speakers: z.number(),
      min_speakers: z.number(),
      align_model: z.string().nullable(),
      asr_options: z.object({
        patience: z.number(),
        beam_size: z.number(),
        temperatures: z.number(),
        initial_prompt: z.string().nullable(),
        length_penalty: z.number(),
        suppress_tokens: z.array(z.number()),
        suppress_numerals: z.boolean(),
        log_prob_threshold: z.number(),
        no_speech_threshold: z.number(),
        compression_ratio_threshold: z.number(),
      }),
      vad_options: z.object({
        vad_onset: z.number(),
        vad_offset: z.number(),
      }),
    }),
    task_type: z.string(),
    url: z.string().nullable(),
  }),
})

export type ITranscription = z.infer<typeof transcriptionTypeSchema>

export interface EmotionValues {
  pos: number[]
  neu: number[]
  neg: number[]
}
export interface SentimentValues {
  joy: number[]
  fear: number[]
  anger: number[]
  others: number[]
  disgust: number[]
}

export interface HateValues {
  hateful: number[]
  targeted: number[]
  aggressive: number[]
}

export interface EmotionAverage {
  pos: number
  neu: number
  neg: number
}
export interface SentimentAverage {
  joy: number
  fear: number
  anger: number
  others: number
  disgust: number
}
export interface HateSpeechAverage {
  hateful: number
  targeted: number
  aggressive: number
}

export interface Averages {
  emotionAverage: EmotionAverage
  sentimentAverage: SentimentAverage
  hateSpeechAverage: HateSpeechAverage
}

export const EmotionsSchema = z.enum([
  "joy",
  "fear",
  "anger",
  "others",
  "disgust",
  "sadness",
  "surprise",
])

export const FoundWordsState = z.tuple([z.boolean(), z.string(), z.number()])
export type FoundWordsState = z.infer<typeof FoundWordsState>

export const taskRecordsStatusSchema = z
  .enum([
    "completed",
    "processing",
    "failed",
    "analyzed",
    "pending",
    "analyzing",
  ])
  .nullable()

export const tasksRecordsResponseSchema = z.object({
  uuid: z.string().uuid(),
  file_name: z.string(),
  status: taskRecordsStatusSchema,
  audio_duration: z.number().nullable(),
  user: z.number().nullable(),
  inicio: z.string().nullable(),
  campaign: z.number().nullable(),
  URL: z.string().nullable(),
})

export type TasksRecordsResponse = z.infer<typeof tasksRecordsResponseSchema>

const originalTaskRecordsParamsSchema = tasksRecordsResponseSchema.pick({
  uuid: true,
  file_name: true,
  status: true,
  user: true,
  campaign: true,
})

export const taskRecordsParamsSchema = originalTaskRecordsParamsSchema.extend({
  uuid: z.string().nullable(),
  file_name: z.string().nullable(),
  page: z.number(),
  globalSearch: z.string().nullable(),
  sortBy: z
    .enum(["uuid", "status", "user", "campaign", "audio_duration", "inicio"])
    .nullable(),
  sortOrder: z.enum(["asc", "desc"]).nullable(),
})
export type TaskRecordsSearchParams = z.infer<typeof taskRecordsParamsSchema>

export const tasksRecordsInternalResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      tasks: z.array(tasksRecordsResponseSchema),
      hasMore: z.boolean(),
      total: z.number(),
      pages: z.number(),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ]
)

export type TasksRecordsInternalResponse = z.infer<
  typeof tasksRecordsInternalResponseSchema
>

export const segmentAnalyisSchema = z.object({
  segment: z.string(),
  start: z.number(),
  joy: z.number(),
  fear: z.number(),
  anger: z.number(),
  others: z.number(),
  disgust: z.number(),
  sadness: z.number(),
  surprise: z.number(),
  NEG: z.number(),
  NEU: z.number(),
  POS: z.number(),
  hateful: z.number(),
  targeted: z.number(),
  aggressive: z.number(),
})

export type SegmentAnalysis = z.infer<typeof segmentAnalyisSchema>

export const notificationSchema = z.object({
  uuid: z.string(),
  timestamp: z.number(),
  read: z.boolean(),
  text: z.string(),
  variant: z.enum(["default", "success", "destructive"]).optional(),
  task: z
    .object({
      identifier: z.string(),
      file_name: z.string().optional(),
    })
    .optional(),
  isGlobal: z.boolean().optional(),
})

export const notificationsResponseSchema = z.object({
  notifications: z.array(notificationSchema),
  total: z.number(),
  pages: z.number(),
  nextCursor: z.number().nullable(),
})

export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>

export type Notification = z.infer<typeof notificationSchema>
export type Notifications = Notification[]
