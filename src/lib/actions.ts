"use server"
import type {
  Tasks,
  Task,
  TranscriptionType,
  Recording,
  Recordings,
} from "@/lib/types"

import { _urlBase, _urlCanary } from "@/lib/api/paths"

class FetchAPIConfig {
  public static ACCEPTED_ORIGINS = [_urlBase, _urlCanary]

  public static validateOrigin(origin: string): string {
    return (
      FetchAPIConfig.ACCEPTED_ORIGINS.find(
        originFromList => origin === originFromList
      ) || ""
    )
  }
}

class HeadersUtil {
  public static getHeaders(origin: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    const validatedOrigin = FetchAPIConfig.validateOrigin(origin)
    if (validatedOrigin) {
      headers["Access-Control-Allow-Origin"] = validatedOrigin
    }
    return headers
  }
}
/**
 * Devuelve la respuesta genérica como un json
 */

class GenericAPI {
  protected async request<T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: any,
    options?: { revalidate?: boolean }
  ): Promise<T> {
    const fetchOptions: any = {
      headers,
      method,
    }
    if (body) {
      fetchOptions.body = JSON.stringify(body)
    }
    if (options?.revalidate) {
      fetchOptions.next = { revalidate: 10 }
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

  protected get<T>(
    url: string,
    headers: Record<string, string>,
    options?: { revalidate?: boolean }
  ): Promise<T> {
    return this.request<T>(url, "GET", headers, null, options)
  }

  protected post<T>(
    url: string,
    headers: Record<string, string>,
    body: any,
    options?: { revalidate?: boolean }
  ): Promise<T> {
    return this.request<T>(url, "POST", headers, body, options)
  }

  /**
   * No utilizado por ahora
   */
  protected put<T>(
    url: string,
    headers: Record<string, string>,
    body: any,
    options?: { revalidate?: boolean }
  ): Promise<T> {
    return this.request<T>(url, "PUT", headers, body, options)
  }

  /**
   * No utilizado por ahora
   */
  protected patch<T>(
    url: string,
    headers: Record<string, string>,
    body: any,
    options?: { revalidate?: boolean }
  ): Promise<T> {
    return this.request<T>(url, "PATCH", headers, body, options)
  }

  protected delete<T>(
    url: string,
    headers: Record<string, string>,
    options?: { revalidate?: boolean }
  ): Promise<T> {
    return this.request<T>(url, "DELETE", headers, null, options)
  }
}

class TasksAPI extends GenericAPI {
  private baseUrl: string
  private path: string
  constructor(baseUrl: string, path: string) {
    super()
    this.baseUrl = baseUrl
    this.path = path
  }

  private constructUrl(id?: Task["identifier"]): string {
    return id
      ? `${this.baseUrl}${this.path}/${id}`
      : `${this.baseUrl}${this.path}`
  }

  public async getTasks(revalidate?: boolean): Promise<Tasks> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl()
    return this.get<{ tasks: Tasks }>(url, headers, { revalidate }).then(
      data => data.tasks
    )
  }

  public async getTask(
    id: Task["identifier"],
    revalidate?: boolean
  ): Promise<Task> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.get<Task>(url, headers, { revalidate })
  }

  public async createTask(
    nasUrl?: string,
    file?: string,
    revalidate?: boolean
  ): Promise<Task> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl()
    return this.post<Task>(url, headers, nasUrl, { revalidate })
  }
  /**
   * UNUSED TEMPORARILY
   */
  public async updateTask(
    id: Task["identifier"],
    task: Partial<Task>,
    revalidate?: boolean
  ): Promise<Task> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.put<Task>(url, headers, task, { revalidate })
  }
  /**
   * UNUSED TEMPORARILY
   */
  public async patchTask(
    id: Task["identifier"],
    task: Partial<Task>,
    revalidate?: boolean
  ): Promise<Task> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.patch<Task>(url, headers, task, { revalidate })
  }

  public async deleteTask(
    id: Task["identifier"],
    revalidate?: boolean
  ): Promise<boolean> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.delete<boolean>(url, headers, { revalidate })
  }

  public async deleteTasks(
    ids: Task["identifier"][],
    revalidate?: boolean
  ): Promise<boolean[]> {
    const deletePromises = ids.map(id => this.deleteTask(id, revalidate))
    return Promise.all(deletePromises)
  }
}

class RecordingsAPI extends GenericAPI {
  private baseUrl: string
  private path: string

  constructor(baseUrl: string, path: string) {
    super()
    this.baseUrl = baseUrl
    this.path = path
  }

  private constructUrl(id?: string): string {
    return id
      ? `${this.baseUrl}${this.path}/${id}`
      : `${this.baseUrl}${this.path}`
  }

  public async getRecords(revalidate?: boolean): Promise<Recordings> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl()
    return this.get<{ records: Recordings }>(url, headers, { revalidate }).then(
      data => data.records
    )
  }

  public async getRecord(id: string, revalidate?: boolean): Promise<Recording> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.get<Recording>(url, headers, { revalidate })
  }

  public async createRecord(
    record: Recording,
    revalidate?: boolean
  ): Promise<Recording> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl()
    return this.post<Recording>(url, headers, record, { revalidate })
  }

  public async updateRecord(
    id: string,
    record: Partial<Recording>,
    revalidate?: boolean
  ): Promise<Recording> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.put<Recording>(url, headers, record, { revalidate })
  }

  public async patchRecord(
    id: string,
    record: Partial<Recording>,
    revalidate?: boolean
  ): Promise<Recording> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.patch<Recording>(url, headers, record, { revalidate })
  }

  public async deleteRecord(
    id: string,
    revalidate?: boolean
  ): Promise<boolean> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl(id)
    return this.delete<boolean>(url, headers, { revalidate })
  }

  public async deleteRecords(
    ids: string[],
    revalidate?: boolean
  ): Promise<boolean[]> {
    const deletePromises = ids.map(id => this.deleteRecord(id, revalidate))
    return Promise.all(deletePromises)
  }
}

class TranscriptionsAPI extends GenericAPI {
  private baseUrl: string
  private path: string

  constructor(baseUrl: string, path: string) {
    super()
    this.baseUrl = baseUrl
    this.path = path
  }

  private constructUrl(id?: Task["identifier"]): string {
    return id
      ? `${this.baseUrl}${this.path}/${id}`
      : `${this.baseUrl}${this.path}`
  }

  public async createTranscription(
    body?: Record<string, string>,
    revalidate?: boolean
  ): Promise<TranscriptionType> {
    const headers = HeadersUtil.getHeaders(this.baseUrl)
    const url = this.constructUrl()
    return this.post(url, headers, body, {
      revalidate,
    })
  }
}

export { TasksAPI, RecordingsAPI, TranscriptionsAPI }

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
