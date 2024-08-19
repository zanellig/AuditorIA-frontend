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

import { API_MAIN, API_CANARY, TASK_PATH } from "@/lib/consts"
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

async function createTask(formData: FormData | string): Promise<any> {
  const headers = getHeaders(API_MAIN, AllowedContentTypes.Multipart)
  const url = [API_MAIN, TASK_PATH].join("/")

  console.log("formData", formData)

  // if (file && file instanceof File) {
  //   formData.append("file", file, file.name)
  // } else if (nasUrl && fileName) {
  //   try {
  //     const binaryFromNAS = await readFile(nasUrl)
  //     const fileType = fileName.split(".").pop()
  //     if (binaryFromNAS) {
  //       const blob = new File([binaryFromNAS], fileName, {
  //         type: `audio/${fileType}`,
  //       })
  //       formData.append("file", blob, fileName)
  //     } else {
  //       throw new Error("Failed to read file at createTask")
  //     }
  //   } catch (error: any) {
  //     throw new Error(`${error.message} at createTask`)
  //   }
  // }

  return _post(url, formData, headers, { revalidate: false })
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

async function getSpeakerProfileLLM(id: Task["identifier"]) {
  const headers = getHeaders(API_CANARY)
  const url = `${API_CANARY}/tasks/spkanalysis/${id}`

  return _get<any>(url, headers)
}

async function calculateAverages(segments: Segment[]) {
  return await calculateAverageForSegments(segments)
}

export {
  actionRevalidatePath,
  analyzeTask,
  getTasks,
  getTask,
  createTask,
  updateTask, // unused until we implement the patch task endpoint on the backend
  deleteTask,
  deleteTasks,
  getAnalysis,
  getRecords,
  getRecord,
  getSpeakerProfileLLM,
  calculateAverages,
}
export async function TEST_GetAudioFromPrivateRoute(url: string) {
  const LOCAL_SERVER_PATH = path.join(process.cwd())
  console.warn(`cwd: ${LOCAL_SERVER_PATH} \nurl from client: ${url}`)
}
