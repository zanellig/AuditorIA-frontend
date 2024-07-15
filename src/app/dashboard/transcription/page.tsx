import { useSearchParams } from "next/navigation"
import { _urlBase, _transcriptPath } from "@/lib/api/paths"
import Transcription from "@/components/Transcription"
import { useEffect, useState } from "react"
import { Task, TranscriptionType } from "@/lib/tasks"
import Loading from "./loading"

import path from "node:path"
import { promises as fs } from "node:fs"

async function getMockTranscription() {
  const TASKS_FILE_PATH = path.join(
    process.cwd(),
    "public",
    "mock",
    "respuesta-transcripcion.json"
  )
  let rawData = await fs.readFile(TASKS_FILE_PATH, "utf8")
  let data = await JSON.parse(rawData)

  return data
}

async function getMockAllTasks() {
  const TASKS_FILE_PATH = path.join(
    process.cwd(),
    "public",
    "mock",
    "respuesta-all-tasks.json"
  )
  let rawData = await fs.readFile(TASKS_FILE_PATH, "utf8")
  let data = await JSON.parse(rawData)

  return data
}

export default async function Page() {
  // const searchParams = useSearchParams()
  // const search = searchParams.get("search")
  let transcriptionBodyTemp: TranscriptionType | null = null
  if (!!transcriptionBodyTemp) return <Loading />
  const transcriptionBody: TranscriptionType = await getMockTranscription()
  const allTranscriptions = await getMockAllTasks()
  /**
   * Here the audioFileName is going to be always the same until we implement fetching.
   * This is because the file's metadata is always the same even though the UUID passed is queried correctly.
   */
  const audioFileName = transcriptionBody?.metadata.file_name

  const matchedTranscription: Task = allTranscriptions.find((t: Task) => {
    // console.log(
    //   "Transcripción de la lista: " + { ...t },
    //   "Transcripción original: " + audioFileName
    // )
    return t.file_name === audioFileName
  })
  const UUID: Task["identifier"] = matchedTranscription.identifier

  /**
   * UNCOMMENT TO SHOW LOADING
   */
  // return <Loading />
  if (transcriptionBody?.status === "processing") return <Loading />

  return <Transcription transcriptionBody={transcriptionBody} UUID={UUID} />
}

/**
 * TODO: SIN USAR HASTA QUE SE LEVANTE LA API
 */
/*
async function getTranscription(id: string | null) {
  const url = `${_urlBase}${_transcriptPath}/${id}`

  const response = await fetch(url, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    method: "GET",
    next: {
      revalidate: 5,
    },
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const jsonRes = await response.json()
  console.log(jsonRes)
  return jsonRes
}

export default function Page() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search")
  const [transcriptionBody, setTranscriptionBody] =
    useState<TranscriptionType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (search) {
      getTranscription(search)
        .then(transcription => setTranscriptionBody(transcription))
        .catch(err => setError(err.message))
    }
  }, [search])

  if (error) {
    throw new Error(error)
  }

  if (
    !!!transcriptionBody ||
    // transcriptionBody.status === "pending" ||
    transcriptionBody.status === "processing"
    // || transcriptionBody.status === "Pendiente" ||
    // transcriptionBody.status === "Procesando"
  ) {
    return <Loading />
  }

  return (
    <Transcription
      key={search}
      transcriptionBody={transcriptionBody as TranscriptionType}
    />
  )
}
*/
