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
export type Analysis = {
  message: AnalysisMessage
}

export const Status = z.enum([
  "completed",
  "processing",
  "failed",
  "analyzed",
  "pending",
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

export type TaskPOSTResponse = {
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
  INICIO: z.date(),
  FIN: z.date(),
  SECTOT: z.number(),
  URL: z.string(),
})
export type Recording = z.infer<typeof recordingSchema>
export type Recordings = Recording[]

export enum Method {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
}
export interface FetchOptions extends RequestInit {
  headers: Record<string, string>
  method: Methods
  body?: any
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

export type TranscriptionType = z.infer<typeof transcriptionTypeSchema>

export type EmotionValues = {
  pos: number[]
  neu: number[]
  neg: number[]
}
export type SentimentValues = {
  joy: number[]
  fear: number[]
  anger: number[]
  others: number[]
  disgust: number[]
}

export type HateValues = {
  hateful: number[]
  targeted: number[]
  aggressive: number[]
}

export type EmotionAverage = {
  pos: number
  neu: number
  neg: number
}
export type SentimentAverage = {
  joy: number
  fear: number
  anger: number
  others: number
  disgust: number
}
export type HateSpeechAverage = {
  hateful: number
  targeted: number
  aggressive: number
}

export interface Averages {
  emotionAverage: EmotionAverage
  sentimentAverage: SentimentAverage
  hateSpeechAverage: HateSpeechAverage
}

export enum Emotions {
  Joy = "Joy" | "Disfrute",
  Fear = "Fear" | "Miedo",
  Anger = "Anger" | "Enojo",
  Others = "Others" | "Otros",
  Disgust = "Disgust" | "Disgusto",
}

export const FoundWordsState = z.tuple([z.boolean(), z.string(), z.number()])
export type FoundWordsState = z.infer<typeof FoundWordsState>
