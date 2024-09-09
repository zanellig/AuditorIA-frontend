// @/lib/actions.ts
"use server"
import "server-only"
import {
  Analysis,
  Tasks,
  Task,
  TranscriptionType,
  Recording,
  Recordings,
  Segment,
} from "@/lib/types.d"

import fs from "node:fs/promises"
import path from "node:path"

import { API_MAIN, API_CANARY, TASK_PATH } from "@/lib/consts"
import { revalidatePath } from "next/cache"
import { calculateAverageForSegments } from "@/lib/utils"
import { getHeaders, AllowedContentTypes } from "@/lib/utils"

import { _request, _get, _post, _put, _patch, _delete } from "@/lib/fetcher"

import { TESTING_RECORDINGS, TESTING } from "@/lib/consts"
import { getNetworkAudio } from "./audio"
import { SignupFormSchema, FormState } from "@/lib/auth/auth"
import { useQuery } from "@tanstack/react-query"

export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Call the provider or db to create a user...
}

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

function constructUrl(apiUrl: string, path: string, id?: string): string {
  return id ? `${apiUrl}${path}/${id}` : `${apiUrl}${path}`
}

export async function getTasks(urlArr: Array<string>, revalidate?: boolean) {
  const headers = getHeaders(urlArr[0])
  const url = [...urlArr].join("/")
  if (TESTING) {
    return []
  }
  return _get(url, headers, {
    revalidate: revalidate,
  })
}

export async function getTask(
  urlArr: Array<string>,
  id: Task["identifier"],
  revalidate?: boolean
) {
  const headers = getHeaders(urlArr[0])
  urlArr.push(id)
  const url = [...urlArr].join("/")
  return _get(url, headers, { revalidate })
}

export async function createTask(
  formData: FormData,
  options: { file?: File; nasUrl?: string; fileName?: string } = {}
): Promise<[Error | null, Response | null]> {
  const headers = getHeaders(API_MAIN, AllowedContentTypes.Multipart)
  const url = [API_MAIN, TASK_PATH].join("/")

  console.log("formData", formData)
  console.log("options", options)

  if (options.file && options.file instanceof File) {
    const file = options.file
    formData.append("file", file, file.name)
  } else if (options.nasUrl && options.fileName) {
    const nasUrl = options.nasUrl
    const fileName = options.fileName
    try {
      const binaryFromNAS = await readFile(nasUrl)
      const fileType = fileName.split(".").pop()
      if (binaryFromNAS) {
        const blob = new File([binaryFromNAS], fileName, {
          type: `audio/${fileType}`,
        })
        formData.append("file", blob, fileName)
      } else {
        return [new Error("Failed to read file at createTask"), null]
      }
    } catch (error: any) {
      return [new Error(`${error.message} at createTask`), null]
    }
  }

  return _post(url, formData, headers, { revalidate: false, expectJson: true })
}

/**
 * unused until we implement the patch task endpoint on the backend
 */
// async function updateTask(
//   baseUrl: string,
//   urlPath: string,
//   id: Task["identifier"],
//   task: Partial<Task>,
//   revalidate?: boolean
// ) {
//   const headers = getHeaders(baseUrl)
//   const url = constructUrl(baseUrl, urlPath, id)
//   return _patch(url, headers, task, { revalidate })
// }

// async function patchTask(
//   baseUrl: string,
//   urlPath: string,
//   id: Task["identifier"],
//   task: Partial<Task>,
//   revalidate?: boolean
// ): Promise<Task> {
//   const headers = getHeaders(baseUrl)
//   const url = constructUrl(baseUrl, urlPath, id)
//   return _patch<Task>(url, headers, task, { revalidate })
// }

export async function deleteTask(
  urlArr: Array<string>,
  id: Task["identifier"],
  revalidate?: boolean
) {
  const headers = getHeaders(urlArr[0])
  let url = [...urlArr].join("/")
  url = url.concat(`/${id}`)
  revalidatePath("/", "layout")
  return _delete(url, headers, { revalidate })
}

export async function deleteTasks(
  urlArr: Array<string>,
  ids: Task["identifier"][],
  revalidate?: boolean
) {
  const deletePromises = ids.map(async (id, i) => {
    return await deleteTask(urlArr, id, revalidate)
  })
  const results = await Promise.allSettled(deletePromises)

  revalidatePath("/", "layout")
  return results
}

export async function analyzeTask(
  urlArr: Array<string>,
  id: Task["identifier"],
  language: Task["language"],
  revalidate?: boolean
) {
  const headers = getHeaders(urlArr[0])
  let url = [...urlArr].join("/")
  url = url.concat(`/${id}`).concat(`?lang=${language}`)
  return _put(url, null, headers, { revalidate })
}

export async function getRecords(urlArr: Array<string>, revalidate?: boolean) {
  const headers = getHeaders(urlArr[0])
  const url = [...urlArr].join("/")
  const cacheDir = path.join(process.cwd(), "cache")
  const cacheFile = path.join(cacheDir, "recordings.json")
  const metaFile = path.join(cacheDir, "recordings_meta.json")
  const TTL = 900000 // 15 minutes in milliseconds

  if (TESTING) {
    await fs.access(cacheFile)
    const cachedData = await fs.readFile(cacheFile, "utf-8")
    return JSON.parse(cachedData)
  }
  try {
    const metaStats = await fs.stat(metaFile)
    const fileAge = Date.now() - metaStats.mtimeMs

    if (fileAge < TTL) {
      // const metaData = JSON.parse(await fs.readFile(metaFile, "utf-8"))
      await fs.access(cacheFile)
      const cachedData = await fs.readFile(cacheFile, "utf-8")
      return JSON.parse(cachedData)
    }
  } catch (error) {
    // File doesn't exist or other error
    console.warn(error)
  }

  const [err, data] = await _get(url, headers, { revalidate })
  if (err !== null) {
    return [err, null]
  }
  const records = await data?.json()

  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(cacheFile, JSON.stringify(records))

  const metaData = { lastUpdated: Date.now() }
  await fs.writeFile(metaFile, JSON.stringify(metaData))

  return [null, records]
}

export async function getRecord(
  urlArr: Array<string>,
  GRABACION: string,
  revalidate?: boolean
) {
  const headers = getHeaders(urlArr[0])
  let url = [...urlArr].join("/")
  url = url.concat(`?GRABACION=${GRABACION}`)
  console.log("url", url)

  return _get(url, headers, { revalidate })
}

export async function getAnalysis(
  urlArr: Array<string>,
  id: string,
  revalidate: boolean = false
) {
  const headers = getHeaders(urlArr[0])
  const url = [...urlArr].join("/")

  return _get(url, headers, { revalidate })
}

export async function actionRevalidatePath(path: string) {
  revalidatePath(path)
}

export async function calculateAverages(segments: Segment[]) {
  return await calculateAverageForSegments(segments)
}

export const fetchAudioData = async (nasPath: string) => {
  // Replace this with your actual API call to fetch audio data from the NAS
  const [err, res] = await getNetworkAudio(encodeURIComponent(nasPath))
  if (err !== null) {
    return new Error("Failed to fetch audio data")
  }

  return res !== null ? res.blob() : null
}

export const getOperatorQuality = async (taskId: string) => {
  const res = await fetch("/api/task/operator_quality/" + taskId)
  return res.json()
}

export const fetchLLMAnalysis = async (taskId: string) => {
  const [err, res] = await getAnalysis([API_MAIN, TASK_PATH], taskId, true)
  if (err !== null) {
    return new Error("Failed to fetch LLM analysis")
  }
  return res !== null ? res.json() : null
}

export const getAudioPath = async (
  file_name: string
): Promise<Recording["URL"] | null> => {
  const [err, res] = await fetch(
    `http://10.20.30.211:3001/api/recordings?GRABACION=${file_name}`,
    { method: "GET" }
  ).then(async res => await res.json())
  if (err !== null) {
    throw new Error(
      "Failed to fetch audio from file name on fetchRecordByFileName" + err
    )
  }
  if (res) {
    return res.records[0].URL
  }
  return null
}
