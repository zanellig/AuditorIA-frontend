import { cn } from "./utils"

export const GLOBAL_ICON_SIZE: number = 16
export const NAVIGATION_ICON_SIZE: number = GLOBAL_ICON_SIZE + 2
export const POSITIVE_SENTIMENT_COLOR = "green-500"
export const NEUTRAL_SENTIMENT_COLOR = "yellow-500"
export const NEGATIVE_SENTIMENT_COLOR = "red-500"
export const JOY_EMOTION_COLOR = "#32cd32"
export const FEAR_EMOTION_COLOR = "#1e90ff"
export const ANGER_EMOTION_COLOR = "#ff4500"
export const DISGUST_EMOTION_COLOR = "#8a2be2"
export const OTHERS_EMOTION_COLOR = "#ff7f50"
export const DASHBOARD_ICON_CLASSES =
  "w-[1.2rem] h-[1.2rem] text-muted-foreground"
export const SPEAKER_ICON_CLASSES = cn(
  DASHBOARD_ICON_CLASSES,
  "w-[1rem] h-[1rem]"
)
export const ACCEPTED_AUDIO_TYPES = [
  "wav",
  "x-wav",
  "mp3",
  "mpeg",
  "aac",
  "ogg",
  "webm",
  "flac",
  "x-flac",
]

export const TESTING = false
export const TESTING_RECORDINGS = false