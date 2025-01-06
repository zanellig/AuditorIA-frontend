import "server-only"
import { env } from "@/env"
import { getDeviceInfo } from "@/host"
export const INTERNAL_API =
  env.APP_ENV === "local"
    ? `http://localhost:${env.PORT}`
    : env.APP_ENV === "remote" || env.APP_ENV === "linux"
      ? `http://${env.HOST || getDeviceInfo().ipAddress}:${env.PORT}`
      : "no-host-defined"

export const ALL_TASKS_PATH = "tasks"
export const TASK_PATH = "task"
export const ALL_RECORDS_PATH = "records"
export const SPEECH_TO_TEXT_PATH = "speech-to-text"
export const FEEDBACK_PATH = "help/send-feedback"
export const FEATURE_PATH = "help/recommend-feature"
export const BUG_PATH = "help/report-bug"
export const SPEAKER_ANALYSIS_PATH = "spkanalysis"
export const OPERATOR_QUALITY_PATH = "operator_quality"
