// @/lib/actions.ts
"use server"
import "server-only"
import { Task, Recording, Segment } from "@/lib/types"
import fs from "fs/promises"
import path from "path"
import { INTERNAL_API, TASK_PATH } from "@/server-constants"
import { revalidatePath } from "next/cache"
import { calculateAverageForSegments } from "@/lib/utils"
import { _delete } from "@/lib/fetcher"
import { getNetworkAudio } from "./audio"
import { env } from "@/env"

export async function readFile(filePath: string): Promise<Buffer | null> {
  let data = null
  try {
    const normalizedPath = path.normalize(filePath)
    data = await fs.readFile(normalizedPath)
    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading file: ${error.message}`)
      throw error
    }
  }
  return data
}
/**
 * @deprecated
 */
export async function deleteTask(id: Task["identifier"], revalidate?: boolean) {
  const url = `${env.API_MAIN}/${TASK_PATH}/${id}`
  revalidatePath("/", "layout")
  return _delete(url, undefined, { revalidate })
}
/**
 * @deprecated
 */
export async function deleteTasks(
  ids: Task["identifier"][],
  revalidate?: boolean
) {
  // TODO: change to promise stack and await the result of deleteTask before sending another request
  const deletePromises = ids.map(async id => {
    return await deleteTask(id, revalidate)
  })
  const results = await Promise.allSettled(deletePromises)

  revalidatePath("/", "layout")
  return results
}

export async function actionRevalidatePath(path: string) {
  revalidatePath(path)
}

export async function calculateAverages(segments: Segment[]) {
  return await calculateAverageForSegments(segments)
}

export const getAudioPath = async (
  file_name: string
): Promise<Recording["URL"] | null> => {
  // Seeing this, we're calling a fetch on a server action. What? Why?
  const [err, res] = await fetch(
    `http://localhost:${env.PORT}/api/recordings?GRABACION=${file_name}`
  )
    .then(async res => {
      if (!res.ok) {
        return [new Error("Failed to fetch audio from file name"), null]
      }
      return await res.json()
    })
    .catch(e => [e, null])
  if (err !== null) {
    console.error("Error getting recording", err)
    return null
  }
  if (res) {
    return res[0].URL
  }
  return null
}

export async function getHost(): Promise<string> {
  return INTERNAL_API
}
