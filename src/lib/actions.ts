// @/lib/actions.ts
"use server"
import "server-only"
import { Task, Recording, Segment } from "@/lib/types.d"
import fs from "node:fs/promises"
import path from "node:path"
import { ACCEPTED_ORIGINS, INTERNAL_API, TASK_PATH } from "@/server-constants"
import { revalidatePath } from "next/cache"
import { calculateAverageForSegments } from "@/lib/utils"
import { getHeaders, AllowedContentTypes } from "@/lib/utils"
import { _request, _get, _post, _put, _patch, _delete } from "@/lib/fetcher"
import { getNetworkAudio } from "./audio"
import { env } from "@/env"

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

export async function deleteTask(id: Task["identifier"], revalidate?: boolean) {
  let url = `${env.API_MAIN}/${TASK_PATH}/${id}`
  revalidatePath("/", "layout")
  return _delete(url, undefined, { revalidate })
}

export async function deleteTasks(
  ids: Task["identifier"][],
  revalidate?: boolean
) {
  // TODO: change to promise stack and await the result of deleteTask before sending another request
  const deletePromises = ids.map(async (id, i) => {
    return await deleteTask(id, revalidate)
  })
  const results = await Promise.allSettled(deletePromises)

  revalidatePath("/", "layout")
  return results
}

/**
 * @deprecated
 */
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

export async function actionRevalidatePath(path: string) {
  revalidatePath(path)
}

export async function calculateAverages(segments: Segment[]) {
  return await calculateAverageForSegments(segments)
}

export const fetchAudioData = async (nasPath: string) => {
  const [err, res] = await getNetworkAudio(nasPath)
  if (err !== null) {
    throw new Error("(1010): Error desconocido al leer el archivo.")
  }
  return res
}

export const getOperatorQuality = async (taskId: string) => {
  const res = await fetch(
    `${await getHost()}/api/task/operator_quality/${taskId}`
  )
  return res.json()
}

export const getAudioPath = async (
  file_name: string
): Promise<Recording["URL"] | null> => {
  // Seeing this, we're calling a fetch on a server action. What? Why?
  const [err, res] = await fetch(
    `${await getHost()}/api/recordings?GRABACION=${file_name}`
  )
    .then(async res => {
      if (!res.ok) {
        return [new Error("Failed to fetch audio from file name"), null]
      }
      return await res.json()
    })
    .catch(e => [e, null])
  if (err !== null) {
    return null
  }
  if (res) {
    return res[0].URL
  }
  return null
}

/** This s-action should not be used
 * @deprecated
 * @param formData
 * @param options
 * @returns
 */
export async function handleTaskUpload(
  formData: FormData,
  options: { file?: File; nasUrl?: string; fileName?: string } = {}
): Promise<[Error | null, Response | null]> {
  /** Necessary headers object to tell the API the content type we're sending it */
  const headers = getHeaders(env.API_MAIN, AllowedContentTypes.Multipart)
  const url = [env.API_MAIN, TASK_PATH].join("/")

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

  return await _post(url, formData, headers, {
    revalidate: false,
    expectJson: true,
  })
}

export async function _validateOrigin(origin: string): Promise<string> {
  return new Promise(async resolve => {
    resolve(
      ACCEPTED_ORIGINS.find(originFromList => origin === originFromList) ||
        (await getHost())
    )
  })
}

export async function getHost(): Promise<string> {
  return INTERNAL_API
}
