"use server"
import { Tasks, Task, TranscriptionType, Records } from "@/lib/types"
import {
  _urlBase,
  _tasksPath,
  _transcriptPath,
  _APIEstable,
  _APICanary,
  _recordsPath,
  _urlCanary,
} from "@/lib/api/paths"

export async function getTasks(): Promise<Tasks> {
  const url = `${_urlBase}${_APIEstable}${_tasksPath}`

  const response = await fetch(url, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    method: "GET",
    next: {
      revalidate: 10,
    },
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const jsonRes = await response.json()

  return jsonRes.tasks as Tasks
}

export async function getTranscription(
  id: Task["identifier"] | null
): Promise<TranscriptionType> {
  if (!id) {
    throw new Error("Task identifier not provided")
  }

  const url = `${_urlBase}${_APIEstable}${_transcriptPath}/${id}`

  const response = await fetch(url, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    method: "GET",
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const jsonRes = await response.json()
  return jsonRes as TranscriptionType
}

export async function getRecords(): Promise<Records> {
  const url = `${_urlCanary}${_APICanary}${_recordsPath}`

  const response = await fetch(url, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    method: "GET",
    next: {
      revalidate: 10,
    },
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const jsonRes = await response.json()
  return jsonRes.records as Records
}
