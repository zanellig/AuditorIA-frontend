import "server-only"
import { env } from "@/env"
export const INTERNAL_API =
  env.NODE_ENV === "development"
  ? `http://0.0.0.0:${env.PORT}`
    : `http://${env.HOST}:${env.PORT}`
export const ACCEPTED_ORIGINS = [
  env.API_MAIN,
  env.API_CANARY,
  INTERNAL_API,
]
export const ALL_TASKS_PATH = "tasks"
export const TASK_PATH = "task"
export const ALL_RECORDS_PATH = "records"
export const SPEECH_TO_TEXT_PATH = "speech-to-text"
export const FEEDBACK_PATH = "help/send-feedback"
export const FEATURE_PATH = "help/recommend-feature"
export const BUG_PATH = "help/report-bug"
export const SPEAKER_ANALYSIS_PATH = "spkanalysis"