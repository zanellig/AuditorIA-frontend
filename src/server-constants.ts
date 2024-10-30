import "server-only"
import { env } from "@/env"
export const INTERNAL_API =
  env.APP_ENV === "local"
    ? `http://localhost:${env.PORT}`
    : env.APP_ENV === "remote"
      ? `http://${env.HOST}`
      : "no-host-defined"

const BASE_URLS = [
  "auditoria.linksolution.com.ar",
  "dev.auditoria.linksolution.com.ar",
  "qa.auditoria.linksolution.com.ar",
  "api.auditoria.linksolution.com.ar",
]

const PORTS = ["", ":3030", ":3000"]
const PROTOCOLS = ["https://", "http://"]

// Generate all combinations of protocol + base + port
export const ALLOWED_ORIGINS = [
  ...BASE_URLS.flatMap(base =>
    PROTOCOLS.flatMap(protocol =>
      PORTS.map(port => `${protocol}${base}${port}`)
    )
  ),
  INTERNAL_API,
  `${INTERNAL_API}:3030`,
  `${INTERNAL_API}:3000`,
].filter(origin => origin !== "no-host-defined")

export const ALL_TASKS_PATH = "tasks"
export const TASK_PATH = "task"
export const ALL_RECORDS_PATH = "records"
export const SPEECH_TO_TEXT_PATH = "speech-to-text"
export const FEEDBACK_PATH = "help/send-feedback"
export const FEATURE_PATH = "help/recommend-feature"
export const BUG_PATH = "help/report-bug"
export const SPEAKER_ANALYSIS_PATH = "spkanalysis"
export const OPERATOR_QUALITY_PATH = "operator_quality"
