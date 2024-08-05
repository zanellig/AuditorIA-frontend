"use server"
import {
  Tasks,
  Task,
  TranscriptionType,
  Recording,
  Recordings,
  Method,
  FetchOptions,
} from "@/lib/types.d"

import fs from "node:fs/promises"
import path from "node:path"

import { _urlBase, _urlCanary } from "@/lib/api/paths"
import { revalidatePath } from "next/cache"

const ACCEPTED_ORIGINS = [_urlBase, _urlCanary]

function _validateOrigin(origin: string): string {
  return (
    ACCEPTED_ORIGINS.find(originFromList => origin === originFromList) || ""
  )
}

function _getHeaders(origin: string, isJson = true): Record<string, string> {
  let headers: Record<string, string> = {}
  if (isJson) {
    headers = {
      "Content-Type": "application/json",
    }
  }
  const validatedOrigin = _validateOrigin(origin)
  if (validatedOrigin) {
    headers["Access-Control-Allow-Origin"] = validatedOrigin
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
    fetchOptions.body = JSON.stringify(body)
    try {
      await fs.writeFile("./request.txt", fetchOptions.body, {
        encoding: "utf-8",
      })
    } catch (e: any) {
      console.error(e.message)
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
  // return [] // CAMBIAR PARA CUANDO AGUS LEVANTE EL SERVER 30
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
  console.log(
    `obteniendo tarea desde: ${url}\ncon headers: ${JSON.stringify(headers)}`
  )
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
): Promise<Task> {
  const headers = _getHeaders(apiUrl, false)
  const url = constructUrl(apiUrl, urlPath)
  type Req = {
    params: any
    file: File | Uint8Array | null
  }
  let body: Req = {
    params: params,
    file: null,
  }
  if (file) {
    body.file = file
  }
  if (nasUrl && fileName) {
    try {
      const cacheDir = path.join(process.cwd(), "cache", "audios")
      let binaryFromNAS
      const cacheDataDir = path.join(cacheDir, fileName)
      await fs.access(cacheDir)
      await fs.copyFile(path.normalize(nasUrl), cacheDataDir)
      binaryFromNAS = await fs.readFile(cacheDataDir)
      binaryFromNAS = new Uint8Array(binaryFromNAS)
      body.file = binaryFromNAS
      console.info(body)
      return _post<Task>(url, headers, body, { revalidate })
    } catch (e: any) {
      // handle access error
      throw Error(e.message)
    }
  }

  return _post<Task>(url, headers, body, { revalidate })
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

  try {
    const metaStats = await fs.stat(metaFile)
    const fileAge = Date.now() - metaStats.mtimeMs

    if (fileAge < TTL) {
      const metaData = JSON.parse(await fs.readFile(metaFile, "utf-8"))
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

async function createRecord(
  apiUrl: string,
  urlPath: string,
  record: Recording,
  revalidate?: boolean
): Promise<Recording> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath)
  return _post<Recording>(url, headers, record, { revalidate })
}

async function updateRecord(
  apiUrl: string,
  urlPath: string,
  id: string,
  record: Partial<Recording>,
  revalidate?: boolean
): Promise<Recording> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath, id)
  return _put<Recording>(url, headers, record, { revalidate })
}

async function patchRecord(
  apiUrl: string,
  urlPath: string,
  id: string,
  record: Partial<Recording>,
  revalidate?: boolean
): Promise<Recording> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath, id)
  return _patch<Recording>(url, headers, record, { revalidate })
}

async function deleteRecord(
  apiUrl: string,
  urlPath: string,
  id: string,
  revalidate?: boolean
): Promise<boolean> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath, id)
  return _delete<boolean>(url, headers, { revalidate })
}

async function deleteRecords(
  apiUrl: string,
  urlPath: string,
  ids: string[],
  revalidate?: boolean
): Promise<boolean[]> {
  const deletePromises = ids.map(id =>
    deleteRecord(apiUrl, urlPath, id, revalidate)
  )
  return Promise.all(deletePromises)
}

async function getAudioFile(filePath: string): Promise<Buffer | null> {
  return readFile(filePath)
}

async function actionRevalidatePath(path: string) {
  revalidatePath(path)
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
  createRecord,
  updateRecord,
  patchRecord,
  deleteRecord,
  deleteRecords,
  getAudioFile,
}
export async function TEST_GetAudioFromPrivateRoute(url: string) {
  const LOCAL_SERVER_PATH = path.join(process.cwd())
  console.warn(`cwd: ${LOCAL_SERVER_PATH} \nurl from client: ${url}`)
}
