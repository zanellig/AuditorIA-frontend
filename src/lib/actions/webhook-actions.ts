"use server"

import { revalidatePath } from "next/cache"
import { CreateWebhook, UpdateWebhook } from "../models/webhook"
import {
  createWebhook,
  deleteWebhook,
  getAllWebhooks,
  getWebhookById,
  updateWebhook,
} from "../repositories/webhook-repository"

// Get all webhooks
export async function getWebhooks() {
  try {
    return await getAllWebhooks()
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    throw new Error("Failed to fetch webhooks")
  }
}

// Get webhook by ID
export async function getWebhook(id: number) {
  try {
    const webhook = await getWebhookById(id)
    if (!webhook) {
      throw new Error("Webhook not found")
    }
    return webhook
  } catch (error) {
    console.error(`Error fetching webhook ${id}:`, error)
    throw new Error("Failed to fetch webhook")
  }
}

// Create a new webhook
export async function addWebhook(webhook: CreateWebhook) {
  try {
    const newWebhook = await createWebhook(webhook)
    revalidatePath("/admin/webhooks")
    return newWebhook
  } catch (error) {
    console.error("Error creating webhook:", error)
    throw new Error("Failed to create webhook")
  }
}

// Update an existing webhook
export async function editWebhook(webhook: UpdateWebhook) {
  try {
    const updatedWebhook = await updateWebhook(webhook)
    if (!updatedWebhook) {
      throw new Error("Webhook not found")
    }
    revalidatePath("/admin/webhooks")
    return updatedWebhook
  } catch (error) {
    console.error(`Error updating webhook ${webhook.id}:`, error)
    throw new Error("Failed to update webhook")
  }
}

// Delete a webhook
export async function removeWebhook(id: number) {
  try {
    const success = await deleteWebhook(id)
    if (!success) {
      throw new Error("Webhook not found")
    }
    revalidatePath("/admin/webhooks")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting webhook ${id}:`, error)
    throw new Error("Failed to delete webhook")
  }
}
