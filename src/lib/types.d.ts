export type Tasks = Task[]
export type Task = {
  identifier: IDNeomirror
  status: Status
  task_type: string
  file_name: Filename
  language: Language
  created_at: Fecha
}

export type Recording = {
  id: number
  fecha: number
  IDLLAMADA: number | string
  IDAPLICACION: number
  USUARIO: number
  ANI_TELEFONO: number
  GRABACION: string
  DIRECCION: string
  INICIO: Date
  FIN: Date
  SECTOT: number
  URL: string
}
export type Recordings = Recording[]

type Status = "completed" | "processing" | "failed" | "Analyzed" | "analyzed"
type Language = "en" | "es"
type IDNeomirror = string
type Fecha = string
type Filename = string

// IMPORTANT
export type GenericRequest = {
  task_type: string
  language: string
  file?: string
  text?: string
  save_to_db: boolean // false
  return_immediate: boolean // false
  diarize: boolean // false
  split_channels: boolean // false
  analyze_sentiment: boolean // false
}

export type SentimentType = "NEG" | "NEU" | "POS"

export type Segment = {
  end: number
  text: string
  start: number
  speaker: string
  analysis: SegmentAnalysisProperties
}

export type TranscriptionType = {
  status: Status
  result: {
    segments: Segment[]
  }
  error: null | string
  metadata: {
    audio_duration: number | null
    duration: number
    file_name: string
    language: Language
    task_params: {
      task: string
      model: string
      device: string
      threads: number
      language: string
      batch_size: number
      compute_type: string
      device_index: number
      max_speakers: number
      min_speakers: number
      align_model: string | null
      asr_options: {
        patience: number
        beam_size: number
        temperatures: number
        initial_prompt: string | null
        length_penalty: number
        suppress_tokens: number[]
        suppress_numerals: boolean
        log_prob_threshold: number
        no_speech_threshold: number
        compression_ratio_threshold: number
      }
      vad_options: {
        vad_onset: number
        vad_offset: number
      }
    }
    task_type: string
    url: string | null
  }
}

export type SegmentAnalysisProperties = {
  emotion: string
  sentiment: SentimentType
  hate_speech: string
  emotion_probas: EmotionProbas
  sentiment_probas: SentimentProbas
  hate_speech_probas: HateSpeechProbas
}

export type EmotionProbas = {
  joy: number
  fear: number
  anger: number
  others: number
  disgust: number
  sadness: number
  surprise: number
}

export type SentimentProbas = {
  NEG: number
  NEU: number
  POS: number
}

export type HateSpeechProbas = {
  hateful: number
  targeted: number
  aggressive: number
}
