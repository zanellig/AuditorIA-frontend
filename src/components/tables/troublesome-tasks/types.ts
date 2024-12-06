import { z } from "zod"

export const TaskRecordsStatus = z
  .enum([
    "completed",
    "processing",
    "failed",
    "analyzed",
    "pending",
    "analyzing",
  ])
  .nullable()

export const TaskRecordsResponseSchema = z.object({
  uuid: z.string(),
  file_name: z.string(),
  status: TaskRecordsStatus,
  audio_duration: z.number().nullable(),
  user: z.number().nullable(),
  inicio: z.date().nullable(),
  campaign: z.number().nullable(),
  URL: z.string().nullable(),
})

export type TaskRecordsResponse = z.infer<typeof TaskRecordsResponseSchema>
