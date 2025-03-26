import { z } from "zod"

// Schema for webhook data validation matching MySQL table structure
export const webhookSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).describe("Unique name for the webhook"),
  base_url: z.string().url(),
  path: z.string().min(1),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})

// Schema for creating a new webhook (without ID)
export const createWebhookSchema = webhookSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Schema for updating an existing webhook (all fields optional except ID)
export const updateWebhookSchema = webhookSchema
  .omit({ created_at: true, updated_at: true })
  .partial()
  .required({ id: true })

// Type definitions based on the schemas
export type Webhook = z.infer<typeof webhookSchema>
export type CreateWebhook = z.infer<typeof createWebhookSchema>
export type UpdateWebhook = z.infer<typeof updateWebhookSchema>
