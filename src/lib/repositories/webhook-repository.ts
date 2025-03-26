import { query } from "@/lib/db"
import { CreateWebhook, UpdateWebhook, Webhook } from "@/lib/models/webhook"

// Error class for duplicate webhook name
export class DuplicateWebhookNameError extends Error {
  constructor(name: string) {
    super(`A webhook with the name "${name}" already exists`)
    this.name = "DuplicateWebhookNameError"
  }
}

// Check if webhook name already exists
export async function checkWebhookNameExists(
  name: string,
  excludeId?: number
): Promise<boolean> {
  let sql = "SELECT COUNT(*) as count FROM webhooks WHERE name = ?"
  const params: any[] = [name]

  if (excludeId) {
    sql += " AND id != ?"
    params.push(excludeId)
  }

  const result = await query<any[]>(sql, params)
  return result[0].count > 0
}

// Get all webhooks
export async function getAllWebhooks(): Promise<Webhook[]> {
  const result = await query<any[]>("SELECT * FROM webhooks ORDER BY name")

  return result.map(row => ({
    id: row.id,
    name: row.name,
    base_url: row.base_url,
    path: row.path,
    created_at: row.created_at ? new Date(row.created_at) : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
  }))
}

// Get a webhook by id
export async function getWebhookById(id: number): Promise<Webhook | null> {
  const result = await query<any[]>("SELECT * FROM webhooks WHERE id = ?", [id])

  if (result.length === 0) {
    return null
  }

  const row = result[0]
  return {
    id: row.id,
    name: row.name,
    base_url: row.base_url,
    path: row.path,
    created_at: row.created_at ? new Date(row.created_at) : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
  }
}

// Create a new webhook
export async function createWebhook(webhook: CreateWebhook): Promise<Webhook> {
  try {
    // Check for duplicate name before inserting
    const nameExists = await checkWebhookNameExists(webhook.name)
    if (nameExists) {
      throw new DuplicateWebhookNameError(webhook.name)
    }

    const result = await query<any>(
      "INSERT INTO webhooks (name, base_url, path) VALUES (?, ?, ?)",
      [webhook.name, webhook.base_url, webhook.path]
    )

    const id = result.insertId
    return (await getWebhookById(id)) as Webhook
  } catch (error) {
    // Detect MySQL duplicate key error
    if (
      error instanceof Error &&
      error.message &&
      error.message.includes("Duplicate entry") &&
      error.message.includes("uk_webhook_name")
    ) {
      throw new DuplicateWebhookNameError(webhook.name)
    }
    throw error
  }
}

// Update an existing webhook
export async function updateWebhook(
  webhook: UpdateWebhook
): Promise<Webhook | null> {
  try {
    // Check for duplicate name before updating (if name is being changed)
    if (webhook.name !== undefined) {
      const nameExists = await checkWebhookNameExists(webhook.name, webhook.id)
      if (nameExists) {
        throw new DuplicateWebhookNameError(webhook.name)
      }
    }

    // Build dynamic update query based on provided fields
    const updates: string[] = []
    const params: any[] = []

    if (webhook.name !== undefined) {
      updates.push("name = ?")
      params.push(webhook.name)
    }

    if (webhook.base_url !== undefined) {
      updates.push("base_url = ?")
      params.push(webhook.base_url)
    }

    if (webhook.path !== undefined) {
      updates.push("path = ?")
      params.push(webhook.path)
    }

    // No fields to update
    if (updates.length === 0) {
      return await getWebhookById(webhook.id)
    }

    // Add the ID to the params array
    params.push(webhook.id)

    // Execute the update query
    await query(
      `UPDATE webhooks SET ${updates.join(", ")} WHERE id = ?`,
      params
    )

    // Return the updated webhook
    return await getWebhookById(webhook.id)
  } catch (error) {
    // Detect MySQL duplicate key error
    if (
      error instanceof Error &&
      error.message &&
      error.message.includes("Duplicate entry") &&
      error.message.includes("uk_webhook_name")
    ) {
      throw new DuplicateWebhookNameError(webhook.name || "")
    }
    throw error
  }
}

// Delete a webhook
export async function deleteWebhook(id: number): Promise<boolean> {
  const result = await query<any>("DELETE FROM webhooks WHERE id = ?", [id])

  return result.affectedRows > 0
}
