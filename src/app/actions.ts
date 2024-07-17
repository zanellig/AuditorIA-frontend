"use server"
import { Tasks, Task } from "@/lib/tasks"
import { _urlBase, _tasksPath } from "@/lib/api/paths"

export async function getTasks() {
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
  console.log(jsonRes)
  return jsonRes.tasks as Tasks
}
