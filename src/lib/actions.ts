"use server"
import {
  Tasks,
  Task,
  TranscriptionType,
  Recording,
  Recordings,
  Method,
  FetchOptions,
  Segment,
} from "@/lib/types.d"

import fs from "node:fs/promises"
import path from "node:path"

import { _urlBase, _urlCanary } from "@/lib/api/paths"
import { revalidatePath } from "next/cache"
import { calculateAverageForSegments } from "./utils"

const TESTING = true

const ACCEPTED_ORIGINS = [_urlBase, _urlCanary]

function _validateOrigin(origin: string): string {
  return (
    ACCEPTED_ORIGINS.find(originFromList => origin === originFromList) || ""
  )
}

enum AllowedContentTypes {
  Json = "json",
  Form = "form",
  Multipart = "multipart",
}

function _getHeaders(
  origin: string,
  contentType?: AllowedContentTypes
): Record<string, string> {
  let headers: Record<string, string> = {}
  switch (contentType) {
    case "json":
      headers["Content-Type"] = "application/json"
      break
    case "form":
      headers["Content-Type"] = "application/x-www-form-urlencoded"
      break
    case "multipart":
      // Don't set Content-Type for multipart/form-data, let the browser set it with the boundary
      break
  }
  const validatedOrigin = _validateOrigin(origin)
  if (validatedOrigin) {
    headers["Access-Control-Allow-Origin"] = validatedOrigin
    // headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    // headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
  }
  return headers
}

async function _request<T>(
  url: string,
  method: Method,
  headers: Record<string, string>,
  body?: any,
  options?: { revalidate?: boolean }
): Promise<T> {
  const fetchOptions: FetchOptions = {
    headers,
    method,
  }

  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body
    } else {
      fetchOptions.body = JSON.stringify(body)
      try {
        await fs.writeFile("./request.txt", fetchOptions.body, {
          encoding: "utf-8",
        })
      } catch (e: any) {
        console.error(e.message)
      }
    }
  }

  if (options?.revalidate) {
    fetchOptions.next = { revalidate: 5 }
  }

  const response = await fetch(url, fetchOptions)
  if (!response.ok) {
    const errorDetail = await response.json()
    console.error(
      `Error ${response.status}: ${response.statusText} - ${errorDetail.message}`
    )
  }
  revalidatePath(`/dashboard`)
  return await response.json()
}

async function readFile(filePath: string): Promise<Buffer | null> {
  let data = null
  try {
    const normalizedPath = path.normalize(filePath)
    data = await fs.readFile(normalizedPath)
    console.log(`File read successfully. Size: ${data.length} bytes`)
    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading file: ${error.message}`)
      throw error
    }
  }
  return data
}

function _get<T>(
  url: string,
  headers: Record<string, string>,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Get, headers, null, options)
}

function _post<T>(
  url: string,
  headers: Record<string, string>,
  body: any,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Post, headers, body, options)
}

function _put<T>(
  url: string,
  headers: Record<string, string>,
  body: any,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Put, headers, body, options)
}

function _patch<T>(
  url: string,
  headers: Record<string, string>,
  body: any,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Patch, headers, body, options)
}

function _delete<T>(
  url: string,
  headers: Record<string, string>,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url + "/delete", Method.Delete, headers, null, options)
}

function constructUrl(apiUrl: string, path: string, id?: string): string {
  return id ? `${apiUrl}${path}/${id}` : `${apiUrl}${path}`
}

async function getTasks(
  apiUrl: string,
  urlPath: string,
  revalidate?: boolean
): Promise<Tasks> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath)
  if (TESTING) {
    return []
  }
  return _get<{ tasks: Tasks }>(url, headers, { revalidate }).then(
    data => data.tasks
  )
}

async function getTask(
  apiUrl: string,
  urlPath: string,
  id: Task["identifier"],
  revalidate?: boolean
): Promise<Task | TranscriptionType> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath, id)
  return _get<Task | TranscriptionType>(url, headers, { revalidate })
}

async function createTask(
  apiUrl: string,
  urlPath: string,
  nasUrl?: string,
  params?: any,
  file?: File | null,
  revalidate = false,
  fileName?: Recording["GRABACION"]
): Promise<any> {
  const headers = _getHeaders(apiUrl, AllowedContentTypes.Multipart)
  const url = constructUrl(apiUrl, urlPath)
  const formData = new FormData()
  formData.append("language", params.language)
  formData.append("device", params.device)
  formData.append("model", params.model)
  formData.append("task_type", params.task_type)

  if (file) {
    formData.append("file", file, file.name)
  } else if (nasUrl && fileName) {
    try {
      const binaryFromNAS = await readFile(nasUrl)
      if (binaryFromNAS) {
        const blob = new Blob([binaryFromNAS], { type: "audio/wav" })
        formData.append("file", blob, fileName)
      } else {
        throw new Error("Failed to read file from NAS")
      }
    } catch (error: any) {
      throw new Error(`${error.message}`)
    }
  }

  return _post(url, headers, formData, { revalidate })
}

async function updateTask(
  baseUrl: string,
  urlPath: string,
  id: Task["identifier"],
  task: Partial<Task>,
  revalidate?: boolean
): Promise<Task> {
  const headers = _getHeaders(baseUrl)
  const url = constructUrl(baseUrl, urlPath, id)
  return _put<Task>(url, headers, task, { revalidate })
}

async function patchTask(
  baseUrl: string,
  urlPath: string,
  id: Task["identifier"],
  task: Partial<Task>,
  revalidate?: boolean
): Promise<Task> {
  const headers = _getHeaders(baseUrl)
  const url = constructUrl(baseUrl, urlPath, id)
  return _patch<Task>(url, headers, task, { revalidate })
}

async function deleteTask(
  baseUrl: string,
  urlPath: string,
  id: Task["identifier"],
  revalidate?: boolean
): Promise<boolean> {
  const headers = _getHeaders(baseUrl)
  const url = constructUrl(baseUrl, urlPath, id)
  return _delete<boolean>(url, headers, { revalidate })
}

async function deleteTasks(
  baseUrl: string,
  urlPath: string,
  ids: Task["identifier"][],
  revalidate?: boolean
): Promise<boolean[]> {
  const deletePromises = ids.map(
    async id => await deleteTask(baseUrl, urlPath, id, revalidate)
  )
  return Promise.all(deletePromises)
}

async function getRecords(
  baseUrl: string,
  urlPath: string,
  revalidate?: boolean
): Promise<Recordings> {
  const headers = _getHeaders(baseUrl)
  const url = constructUrl(baseUrl, urlPath)
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
  apiUrl: string,
  urlPath: string,
  id: string,
  revalidate?: boolean
): Promise<Recording> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath, id)
  return _get<Recording>(url, headers, { revalidate })
}

async function getAudioFile(filePath: string): Promise<Buffer | null> {
  return readFile(filePath)
}

async function actionRevalidatePath(path: string) {
  revalidatePath(path)
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
  getTasks,
  getTask,
  createTask,
  updateTask,
  patchTask,
  deleteTask,
  deleteTasks,
  getRecords,
  getRecord,
  getAudioFile,
  sendTranscriptionToServer,
  calculateAverages,
}
export async function TEST_GetAudioFromPrivateRoute(url: string) {
  const LOCAL_SERVER_PATH = path.join(process.cwd())
  console.warn(`cwd: ${LOCAL_SERVER_PATH} \nurl from client: ${url}`)
}
