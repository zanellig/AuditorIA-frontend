"use server"
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

import { URL_API_MAIN, URL_API_CANARY } from "@/lib/consts"
import { revalidatePath } from "next/cache"
import { calculateAverageForSegments } from "@/lib/utils"
import { getHeaders, AllowedContentTypes } from "@/lib/utils"

import { _request, _get, _post, _put, _patch, _delete } from "@/lib/fetcher"

import { TESTING_RECORDINGS, TESTING } from "@/lib/consts"

async function readFile(filePath: string): Promise<Buffer | null> {
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

async function getTasks(
  urlArr: Array<string>,
  revalidate?: boolean
): Promise<Tasks> {
  const headers = getHeaders(urlArr[0])
  const url = [...urlArr].join("/")
  if (TESTING) {
    return []
  }
  return _get<{ tasks: Tasks }>(url, headers, {
    revalidate: revalidate,
  }).then(data => data.tasks)
}

async function getTask(
  urlArr: Array<string>,
  id: Task["identifier"],
  revalidate?: boolean
): Promise<Task | TranscriptionType> {
  const headers = getHeaders(urlArr[0])
  urlArr.push(id)
  const url = [...urlArr].join("/")
  return _get<Task | TranscriptionType>(url, headers, { revalidate })
}

async function createTask(
  urlArr: Array<string>,
  nasUrl?: string | null,
  params?: any | null,
  file?: File | Blob | null,
  revalidate: boolean = false,
  fileName?: Recording["GRABACION"]
): Promise<any> {
  const headers = getHeaders(urlArr[0], AllowedContentTypes.Multipart)
  const url = [...urlArr].join("/")
  const formData = new FormData()
  formData.append("language", params.language)
  formData.append("device", params.device)
  formData.append("model", params.model)
  formData.append("task_type", params.task_type)

  if (file && file instanceof File) {
    formData.append("file", file, file.name)
  } else if (nasUrl && fileName) {
    try {
      const binaryFromNAS = await readFile(nasUrl)
      const fileType = fileName.split(".").pop()
      if (binaryFromNAS) {
        const blob = new File([binaryFromNAS], fileName, {
          type: `audio/${fileType}`,
        })
        formData.append("file", blob, fileName)
      } else {
        throw new Error("Failed to read file at createTask")
      }
    } catch (error: any) {
      throw new Error(`${error.message} at createTask`)
    }
  }

  return _post(url, headers, formData, { revalidate })
}

/**
 * unused until we implement the patch task endpoint on the backend
 */
async function updateTask(
  baseUrl: string,
  urlPath: string,
  id: Task["identifier"],
  task: Partial<Task>,
  revalidate?: boolean
): Promise<Task> {
  const headers = getHeaders(baseUrl)
  const url = constructUrl(baseUrl, urlPath, id)
  return _patch<Task>(url, headers, task, { revalidate })
}

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

async function deleteTask(
  urlArr: Array<string>,
  id: Task["identifier"],
  revalidate?: boolean
): Promise<boolean> {
  const headers = getHeaders(urlArr[0])
  let url = [...urlArr].join("/")
  url = url.concat(`/${id}`)
  revalidatePath("/", "layout")
  return _delete<boolean>(url, headers, { revalidate })
}

async function deleteTasks(
  urlArr: Array<string>,
  ids: Task["identifier"][],
  revalidate?: boolean
): Promise<PromiseSettledResult<boolean>[]> {
  const deletePromises = ids.map(async (id, i) => {
    return await deleteTask(urlArr, id, revalidate)
  })
  const results = await Promise.allSettled(deletePromises)

  revalidatePath("/", "layout")
  return results
}

async function analyzeTask(
  urlArr: Array<string>,
  id: Task["identifier"],
  language: Task["language"],
  revalidate?: boolean
): Promise<Analysis> {
  const headers = getHeaders(urlArr[0])
  let url = [...urlArr].join("/")
  url = url.concat(`/${id}`).concat(`?lang=${language}`)
  console.log(url)
  console.log(headers)
  return _put<Analysis>(url, null, headers, { revalidate })
}

async function getRecords(
  urlArr: Array<string>,
  revalidate?: boolean
): Promise<Recordings> {
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

  const data = await _get<{ records: Recordings }>(url, headers, { revalidate })
  const records = data.records

  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(cacheFile, JSON.stringify(records))

  const metaData = { lastUpdated: Date.now() }
  await fs.writeFile(metaFile, JSON.stringify(metaData))

  return records
}

async function getRecord(
  urlArr: Array<string>,
  GRABACION: string,
  revalidate?: boolean
): Promise<Recording> {
  const headers = getHeaders(urlArr[0])
  let url = [...urlArr].join("/")
  url = url.concat(`?GRABACION=${GRABACION}`)
  console.log("url", url)

  return _get<Recording>(url, headers, { revalidate })
}

async function getAnalysis(
  urlArr: Array<string>,
  id: string,
  revalidate: boolean = false
) {
  const headers = getHeaders(urlArr[0])
  const url = [...urlArr].join("/")

  return _get<Analysis>(url, headers, { revalidate })
}

async function actionRevalidatePath(path: string) {
  revalidatePath(path)
}

async function checkServerStatus() {
  const URLS = [URL_API_MAIN, URL_API_CANARY + "/docs"]
  const responses = URLS.map(async url => {
    const headers = getHeaders(url)
    await _get<number>(url, headers, {
      revalidate: false,
      onlyReturnStatus: true,
    })
  })
  console.log(`responses: ${responses}`)
}

async function sendTranscriptionToServer(transcription: TranscriptionType) {
  await fs.writeFile(
    "./transcription-from-client.json",
    JSON.stringify(transcription),
    { encoding: "utf-8" }
  )
}

async function calculateAverages(segments: Segment[]) {
  return await calculateAverageForSegments(segments)
}

export {
  actionRevalidatePath,
  analyzeTask,
  getTasks,
  getTask,
  checkServerStatus,
  createTask,
  updateTask, // unused until we implement the patch task endpoint on the backend
  deleteTask,
  deleteTasks,
  getAnalysis,
  getRecords,
  getRecord,
  sendTranscriptionToServer,
  calculateAverages,
}
export async function TEST_GetAudioFromPrivateRoute(url: string) {
  const LOCAL_SERVER_PATH = path.join(process.cwd())
  console.warn(`cwd: ${LOCAL_SERVER_PATH} \nurl from client: ${url}`)
}
