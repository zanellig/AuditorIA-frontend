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

const ACCEPTED_ORIGINS = [_urlBase, _urlCanary]

function _validateOrigin(origin: string): string {
  return (
    ACCEPTED_ORIGINS.find(originFromList => origin === originFromList) || ""
  )
}

function _getHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const validatedOrigin = _validateOrigin(origin)
  if (validatedOrigin) {
    headers["Access-Control-Allow-Origin"] = validatedOrigin
  }
  return headers
}

/**
 * Devuelve la respuesta genérica como un json
 */
// class GenericAPI {
//   protected async request<T>(
//     url: string,
//     method: Method,
//     headers: Record<string, string>,
//     body?: any,
//     options?: { revalidate?: boolean }
//   ): Promise<T> {
//     const fetchOptions: FetchOptions = {
//       headers,
//       method,
//     }

//     if (body) {
//       fetchOptions.body = JSON.stringify(body)
//     }
//     if (options?.revalidate) {
//       fetchOptions.next = { revalidate: 5 }
//     }

//     const response = await fetch(url, fetchOptions)
//     if (!response.ok) {
//       const errorDetail = await response.json()
//       console.error(
//         `Error ${response.status}: ${response.statusText} - ${errorDetail.message}`
//       )
//     }

//     return await response.json()
//   }

//   public async readFile(filePath: string): Promise<Buffer | null> {
//     let data = null
//     try {
//       const normalizedPath = path.normalize(filePath)
//       data = await fs.readFile(normalizedPath)
//       console.log(`File read successfully. Size: ${data.length} bytes`)
//       return data
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error(`Error reading file: ${error.message}`)
//         throw error
//       }
//     }
//     return data
//   }

//   protected get<T>(
//     url: string,
//     headers: Record<string, string>,
//     options?: { revalidate?: boolean }
//   ): Promise<T> {
//     return this.request<T>(url, Method.Get, headers, null, options)
//   }

//   protected post<T>(
//     url: string,
//     headers: Record<string, string>,
//     body: any,
//     options?: { revalidate?: boolean }
//   ): Promise<T> {
//     return this.request<T>(url, Method.Post, headers, body, options)
//   }

//   /**
//    * No utilizado por ahora
//    */
//   protected put<T>(
//     url: string,
//     headers: Record<string, string>,
//     body: any,
//     options?: { revalidate?: boolean }
//   ): Promise<T> {
//     return this.request<T>(url, Method.Put, headers, body, options)
//   }

//   /**
//    * No utilizado por ahora
//    */
//   protected patch<T>(
//     url: string,
//     headers: Record<string, string>,
//     body: any,
//     options?: { revalidate?: boolean }
//   ): Promise<T> {
//     return this.request<T>(url, Method.Patch, headers, body, options)
//   }

//   protected delete<T>(
//     url: string,
//     headers: Record<string, string>,
//     options?: { revalidate?: boolean }
//   ): Promise<T> {
//     return this.request<T>(url, Method.Delete, headers, null, options)
//   }
// }
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
  return _request<T>(url, Method.Delete, headers, null, options)
}

// class TasksAPI extends GenericAPI {
//   private baseUrl: string
//   private path: string
//   constructor(baseUrl: string, path: string) {
//     super()
//     this.baseUrl = baseUrl
//     this.path = path
//   }

//   private constructUrl(id?: Task["identifier"]): string {
//     return id
//       ? `${this.baseUrl}${this.path}/${id}`
//       : `${this.baseUrl}${this.path}`
//   }

//   public async getTasks(revalidate?: boolean): Promise<Tasks> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl()
//     return this.get<{ tasks: Tasks }>(url, headers, { revalidate }).then(
//       data => data.tasks
//     )
//   }

//   public async getTask(
//     id: Task["identifier"],
//     revalidate?: boolean
//   ): Promise<Task | TranscriptionType> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     console.log(
//       `obteniendo tarea desde: ${url}\ncon headers: ${JSON.stringify(headers)}`
//     )
//     return this.get<Task | TranscriptionType>(url, headers, { revalidate })
//   }

//   public async createTask(
//     nasUrl?: string,
//     file?: string,
//     revalidate = false
//   ): Promise<Task> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl()
//     let fileFromNAS
//     if (nasUrl) {
//       fileFromNAS = await fs.readFile(path.normalize(nasUrl))
//       return this.post<Task>(url, headers, fileFromNAS, { revalidate })
//     }
//     return this.post<Task>(url, headers, file, { revalidate })
//   }
//   /**
//    * UNUSED TEMPORARILY
//    */
//   public async updateTask(
//     id: Task["identifier"],
//     task: Partial<Task>,
//     revalidate?: boolean
//   ): Promise<Task> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     return this.put<Task>(url, headers, task, { revalidate })
//   }
//   /**
//    * UNUSED TEMPORARILY
//    */
//   public async patchTask(
//     id: Task["identifier"],
//     task: Partial<Task>,
//     revalidate?: boolean
//   ): Promise<Task> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     return this.patch<Task>(url, headers, task, { revalidate })
//   }

//   public async deleteTask(
//     id: Task["identifier"],
//     revalidate?: boolean
//   ): Promise<boolean> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     return this.delete<boolean>(url, headers, { revalidate })
//   }

//   public async deleteTasks(
//     ids: Task["identifier"][],
//     revalidate?: boolean
//   ): Promise<boolean[]> {
//     const deletePromises = ids.map(id => this.deleteTask(id, revalidate))
//     return Promise.all(deletePromises)
//   }
// }
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
  file?: string,
  revalidate = false
): Promise<Task> {
  const headers = _getHeaders(apiUrl)
  const url = constructUrl(apiUrl, urlPath)
  let body = {
    params: params,
    file: file,
  }

  let fileFromNAS
  if (nasUrl) {
    fileFromNAS = await fs.readFile(path.normalize(nasUrl))
    body.file = fileFromNAS
    return _post<Task>(url, headers, body, { revalidate })
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
  const deletePromises = ids.map(id =>
    deleteTask(baseUrl, urlPath, id, revalidate)
  )
  return Promise.all(deletePromises)
}

// class RecordingsAPI extends GenericAPI {
//   private baseUrl: string
//   private path: string

//   constructor(baseUrl: string, path: string) {
//     super()
//     this.baseUrl = baseUrl
//     this.path = path
//   }

//   private constructUrl(id?: string): string {
//     return id
//       ? `${this.baseUrl}${this.path}/${id}`
//       : `${this.baseUrl}${this.path}`
//   }

//   public async getRecords(revalidate?: boolean): Promise<Recordings> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl()

//     const cacheDir = path.join(process.cwd(), "cache")
//     const cacheFile = path.join(cacheDir, "recordings.json")
//     const metaFile = path.join(cacheDir, "recordings_meta.json")
//     const TTL = 900000 // 15 minutes in milliseconds

//     try {
//       // Check if meta file exists and is not expired
//       const metaStats = await fs.stat(metaFile)
//       const fileAge = Date.now() - metaStats.mtimeMs

//       if (fileAge < TTL && !revalidate) {
//         // Read metadata
//         const metaData = JSON.parse(await fs.readFile(metaFile, "utf-8"))

//         // Check if actual data file exists
//         await fs.access(cacheFile)

//         // If everything is okay, return cached data
//         const cachedData = await fs.readFile(cacheFile, "utf-8")
//         return JSON.parse(cachedData)
//       }
//     } catch (error) {
//       // File doesn't exist or other error, proceed to fetch new data
//     }

//     // Fetch new data
//     const data = await this.get<{ records: Recordings }>(url, headers, {
//       revalidate,
//     })
//     const records = data.records

//     // Cache the new data
//     await fs.mkdir(cacheDir, { recursive: true })
//     await fs.writeFile(cacheFile, JSON.stringify(records))

//     // Update metadata
//     const metaData = { lastUpdated: Date.now() }
//     await fs.writeFile(metaFile, JSON.stringify(metaData))

//     return records
//   }

//   public async getRecord(id: string, revalidate?: boolean): Promise<Recording> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     return this.get<Recording>(url, headers, { revalidate })
//   }

//   public async createRecord(
//     record: Recording,
//     revalidate?: boolean
//   ): Promise<Recording> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl()
//     return this.post<Recording>(url, headers, record, { revalidate })
//   }

//   public async updateRecord(
//     id: string,
//     record: Partial<Recording>,
//     revalidate?: boolean
//   ): Promise<Recording> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     return this.put<Recording>(url, headers, record, { revalidate })
//   }

//   public async patchRecord(
//     id: string,
//     record: Partial<Recording>,
//     revalidate?: boolean
//   ): Promise<Recording> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     return this.patch<Recording>(url, headers, record, { revalidate })
//   }

//   public async deleteRecord(
//     id: string,
//     revalidate?: boolean
//   ): Promise<boolean> {
//     const headers = HeadersUtil.getHeaders(this.baseUrl)
//     const url = this.constructUrl(id)
//     return this.delete<boolean>(url, headers, { revalidate })
//   }

//   public async deleteRecords(
//     ids: string[],
//     revalidate?: boolean
//   ): Promise<boolean[]> {
//     const deletePromises = ids.map(id => this.deleteRecord(id, revalidate))
//     return Promise.all(deletePromises)
//   }

//   public async getAudioFile(filePath: string): Promise<Buffer | null> {
//     return this.readFile(filePath)
//   }
// }
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

    if (fileAge < TTL && !revalidate) {
      const metaData = JSON.parse(await fs.readFile(metaFile, "utf-8"))
      await fs.access(cacheFile)
      const cachedData = await fs.readFile(cacheFile, "utf-8")
      return JSON.parse(cachedData)
    }
  } catch (error) {
    // File doesn't exist or other error, proceed to fetch new data
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

export {
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

// const ACCEPTED_ORIGINS = [
//   `${_urlBase}${_APIEstable}`,
//   `${_urlCanary}${_APICanary}`,
// ]

// const _validateOrigin = function (origin: string): string {
//   let validatedOrigin =
//     ACCEPTED_ORIGINS.find(originFromList => origin === originFromList) || ""
//   return validatedOrigin
// }

// const _getHeaders = function (origin: string) {
//   let headers: { [key: string]: string } = {
//     "Content-Type": "application/json",
//   }
//   const validatedOrigin = _validateOrigin(origin)
//   if (validatedOrigin) {
//     headers["Access-Control-Allow-Origin"] = validatedOrigin
//   }
//   return headers
// }

// export async function getTasks(origin: string): Promise<Tasks> {
//   const url = `${_urlBase}${_APIEstable}${_tasksPath}`

//   const response = await fetch(url, {
//     headers: _getHeaders(origin),
//     method: "GET",
//     next: {
//       revalidate: 10,
//     },
//   })
//   if (!response.ok) {
//     throw new Error(response.statusText)
//   }
//   const jsonRes = await response.json()

//   return jsonRes.tasks as Tasks
// }

// export async function getTranscription(
//   origin: string,
//   id: Task["identifier"] | null
// ): Promise<TranscriptionType> {
//   if (!id) {
//     throw new Error("Task identifier not provided")
//   }

//   const url = `${_urlBase}${_APIEstable}${_transcriptPath}/${id}`

//   const response = await fetch(url, {
//     headers: _getHeaders(origin),
//     method: "GET",
//   })
//   if (!response.ok) {
//     throw new Error(response.statusText)
//   }
//   const jsonRes = await response.json()
//   return jsonRes as TranscriptionType
// }

// export async function getRecords(origin: string): Promise<Records> {
//   const url = `${_urlCanary}${_APICanary}${_recordsPath}`

//   const response = await fetch(url, {
//     headers: _getHeaders(origin),
//     method: "GET",
//   })
//   if (!response.ok) {
//     throw new Error(response.statusText)
//   }
//   const jsonRes = await response.json()
//   return jsonRes.records as Records
// }

// export async function deleteTask(
//   origin: string,
//   id?: Task["identifier"],
//   ids?: Task["identifier"][]
// ) {
//   if (!!ids) {
//     let urls = []
//     for (const taskId of ids) {
//       urls.push(`${_urlBase}${_APIEstable}/${taskId}`)
//     }
//     const deletePromises = urls.map(url =>
//       fetch(url, { method: "DELETE", headers: _getHeaders(origin) })
//     )
//     try {
//       const responses = await Promise.all(deletePromises)
//       return responses.map(response => response.ok)
//     } catch (error) {
//       console.error(error)
//       throw new Error("Failed deleting selected tasks" + error)
//     }
//   }
//   if (!!id) {
//     const url = `${_urlBase}${_APIEstable}/${id}`
//     try {
//       const response = await fetch(url, {
//         method: "DELETE",
//         headers: _getHeaders(origin),
//       })
//       return response.ok
//     } catch (error) {
//       console.error("Error deleting task:", error)
//       throw new Error("Failed to delete task" + error)
//     }
//   }
// }
