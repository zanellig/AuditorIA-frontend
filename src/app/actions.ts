"use server"
import { Tasks, Task, TranscriptionType } from "@/lib/tasks"
import { _urlBase, _tasksPath, _transcriptPath } from "@/lib/api/paths"

export async function getTasks(): Promise<Tasks> {
  const url = `${_urlBase}${_tasksPath}`

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

  const url = `${_urlBase}${_transcriptPath}/${id}`

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
  return jsonRes.task as TranscriptionType
}
