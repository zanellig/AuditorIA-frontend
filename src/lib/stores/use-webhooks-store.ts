import { create } from "zustand"
import { persist } from "zustand/middleware"
import { z } from "zod"

// Schema for webhook data validation
export const webhookSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  base_url: z.string().url(),
  path: z.string(),
  created_at: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  updated_at: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
})

export type WebhookConfig = z.infer<typeof webhookSchema>

// Custom error for duplicate webhook names
export class DuplicateNameError extends Error {
  constructor(name: string) {
    super(`Ya existe un webhook con el nombre "${name}"`)
    this.name = "DuplicateNameError"
  }
}

interface WebhooksState {
  webhooks: WebhookConfig[]
  isLoading: boolean
  error: string | null
  addWebhook: (webhook: Omit<WebhookConfig, "id">, id: number) => void
  updateWebhook: (
    id: number,
    webhook: Partial<Omit<WebhookConfig, "id">>
  ) => void
  deleteWebhook: (id: number) => void
  getWebhookById: (id: number) => WebhookConfig | undefined
  webhookNameExists: (name: string, excludeId?: number) => boolean
  resetWebhooks: () => void
  setWebhooks: (webhooks: WebhookConfig[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  syncWithAPI: () => Promise<void>
}

// Function to fetch webhooks from API
const fetchWebhooksFromAPI = async (): Promise<WebhookConfig[]> => {
  try {
    const response = await fetch("/api/webhooks")
    if (!response.ok) {
      throw new Error("Failed to fetch webhooks from API")
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    throw error
  }
}

export const useWebhooksStore = create<WebhooksState>()(
  persist(
    (set, get) => ({
      webhooks: [],
      isLoading: false,
      error: null,

      // Check if webhook name already exists
      webhookNameExists: (name: string, excludeId?: number): boolean => {
        const webhooks = get().webhooks
        return webhooks.some(
          webhook =>
            webhook.name === name &&
            (excludeId === undefined || webhook.id !== excludeId)
        )
      },

      // Add a new webhook with validation
      addWebhook: (webhook, id) => {
        // Check if name already exists
        if (get().webhookNameExists(webhook.name)) {
          throw new DuplicateNameError(webhook.name)
        }

        set(state => ({
          webhooks: [...state.webhooks, { ...webhook, id }],
        }))
      },

      // Update a webhook with validation
      updateWebhook: (id, webhookUpdate) => {
        // Check if name already exists (if changing the name)
        if (webhookUpdate.name !== undefined) {
          if (get().webhookNameExists(webhookUpdate.name, id)) {
            throw new DuplicateNameError(webhookUpdate.name)
          }
        }

        set(state => ({
          webhooks: state.webhooks.map(webhook =>
            webhook.id === id ? { ...webhook, ...webhookUpdate } : webhook
          ),
        }))
      },

      deleteWebhook: id =>
        set(state => ({
          webhooks: state.webhooks.filter(webhook => webhook.id !== id),
        })),

      getWebhookById: id => {
        return get().webhooks.find(webhook => webhook.id === id)
      },
      resetWebhooks: () => set({ webhooks: [], error: null }),
      setWebhooks: webhooks => set({ webhooks, error: null }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
      syncWithAPI: async () => {
        try {
          set({ isLoading: true, error: null })
          const webhooks = await fetchWebhooksFromAPI()
          set({ webhooks, isLoading: false })
          return Promise.resolve()
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          })
          return Promise.reject(error)
        }
      },
    }),
    {
      name: "webhooks-storage",
    }
  )
)
