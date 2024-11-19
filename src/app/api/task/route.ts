import { _delete, _get, _post, _put } from "@/lib/fetcher"
import {
  ALL_TASKS_PATH,
  SPEECH_TO_TEXT_PATH,
  TASK_PATH,
} from "@/server-constants"
import { TaskPOSTResponse } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { fetchAudioData } from "@/lib/actions"
import { env } from "@/env"
import { validateMimeType } from "@/lib/forms"
import chalk from "chalk"
import { TESTING } from "@/lib/consts"
import * as fs from "fs/promises"
import path from "path"
import { getHeaders } from "@/lib/get-headers"
import { isAuthenticated } from "@/lib/auth"

export const revalidate = 5

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

const unauthorizedResponse = async function (request: NextRequest) {
  return NextResponse.json([new Error("Unauthorized"), null], {
    status: 401,
    headers: await getHeaders(request),
  })
}

export async function GET(request: NextRequest) {
  const authorized = await isAuthenticated()
  if (!authorized) return unauthorizedResponse(request)
  const headers = await getHeaders(request)
  if (headers instanceof NextResponse) return headers
  const identifier = request.nextUrl.searchParams.get("identifier")

  if (TESTING) {
    const filePath = path.join(
      process.cwd(),
      "public",
      "mock",
      "respuesta-transcripcion.json"
    )

    try {
      const fileContent = await fs.readFile(filePath, "utf-8")
      return NextResponse.json([null, JSON.parse(fileContent)], {
        status: 200,
        headers,
      })
    } catch (error) {
      console.error("Error reading the mock file:", error)
      return NextResponse.json(
        { error: "Failed to load mock data" },
        { status: 500, headers }
      )
    }
  }

  if (!identifier) {
    return NextResponse.json(
      [new Error("1001: No se proporcionó un ID de tarea."), null],
      {
        status: 400,
        statusText: "1001: No se proporcionó un ID de tarea.",
        headers,
      }
    )
  }
  const reqUrl = [env.API_MAIN, TASK_PATH, identifier].join("/")
  const [err, res] = await _get(reqUrl, undefined, {
    revalidate: true,
    expectJson: true,
  })

  if (err !== null) {
    /**
     * The ECONNREFUSED (Connection refused) could fall in this case if the server is not running, but we can't access that error message,
     * as far as I know.
     *
     * The message, stack, cause and name don't show anything useful, but if we log the error, we can see that the error message is
     * "ECONNREFUSED".
     *
     * We return a generic 500 error, as we don't want to leak information about the server, but we should improve this.
     * Maybe returning a 503, 522 or 523; I don't know which one is the best fit.
     * */
    console.error(err)
    return NextResponse.json(
      ["(1002): Error interno desconocido al obtener la tarea.", null],
      {
        status: 500,
        statusText: "(1002): Error interno desconocido al obtener la tarea.",
        headers,
      }
    )
  }
  if (res === null) {
    return NextResponse.json(
      [new Error("(1003): Tarea no encontrada."), null],
      {
        status: 404,
        statusText: "(1003): Tarea no encontrada.",
        headers,
      }
    )
  }
  if (res !== null) {
    return NextResponse.json([null, res], {
      status: 200,
      statusText: "Tarea obtenida correctamente.",
      headers,
    })
  }
  return NextResponse.json(
    [new Error("(1004): Error desconocido al obtener la tarea."), null],
    {
      status: 500,
      statusText: "(1004): Error desconocido al obtener la tarea.",
      headers,
    }
  )
}

export async function POST(request: NextRequest) {
  const headers = await getHeaders(request)
  if (headers instanceof NextResponse) return headers
  const rejectResponse = ({ missingData }: { missingData?: string }) =>
    NextResponse.json(
      [
        `(1005): No se pudo ejecutar la consulta. ${missingData ? `${missingData} is missing.` : ""}`,
        null,
      ],
      {
        status: 400,
        statusText: `(1005): No se pudo ejecutar la consulta. ${missingData ? `${missingData} is missing.` : ""}`,
        headers,
      }
    )

  try {
    const params = request.nextUrl.searchParams
    const nasUrl = params.get("nasUrl")
    const fileName = params.get("fileName")
    /** Necessary headers object to tell the API the content type we're sending it */
    const clientForm = await request.formData().catch(e => {
      if (e) return null
    })
    if (!clientForm) return rejectResponse({ missingData: "Form" })
    /** The serverForm is used to send the file to the API. */
    const serverForm = new FormData()
    /** ### The API accepts a no-param URL.
     * **Optional** appendable parameters:
     *  - `language`: the language of the transcription
     *  - `task`: the type of task (transcribe or translate)
     *  - `model`: the Whisper model used to transcribe
     *  - `device`: the device used for inference
     *  - `device_index`: the index of the device used for inference
     *  - `threads`: number of threads used for CPU inference
     *  - `batch_size`: preferred batch size for inference
     *  - `compute_type`: type of computation (float16, int8, float32)
     *  - `align_model`: phoneme-level ASR model for alignment
     *  - `interpolate_method`: method to assign timestamps to non-aligned words
     *  - `return_char_alignments`: whether to return character-level alignments
     *  - `min_speakers`: minimum number of speakers in the audio
     *  - `max_speakers`: maximum number of speakers in the audio
     *  - `beam_size`: number of beams in beam search
     *  - `patience`: patience value for beam decoding
     *  - `length_penalty`: token length penalty coefficient
     *  - `temperatures`: temperature to use for sampling
     *  - `compression_ratio_threshold`: gzip compression ratio threshold for failure
     *  - `log_prob_threshold`: average log probability threshold for failure
     *  - `no_speech_threshold`: silence threshold when logprob threshold fails
     *  - `initial_prompt`: optional text prompt for the first window
     *  - `suppress_tokens`: list of token ids to suppress during sampling
     *  - `suppress_numerals`: suppress numeric and currency symbols during sampling
     *  - `vad_onset`: onset threshold for voice activity detection (VAD)
     *  - `vad_offset`: offset threshold for voice activity detection (VAD)
     */
    const externalRequestUrl = new URL(
      [env.API_MAIN, SPEECH_TO_TEXT_PATH].join("/")
    )
    const isRecordForm = !!(clientForm && nasUrl && fileName)
    const isManualFileUpload = !!(clientForm && !nasUrl && !fileName)

    if (isManualFileUpload && !clientForm?.has("file"))
      return rejectResponse({ missingData: "File in FormData" })
    const file = clientForm.get("file")

    if (isManualFileUpload || isRecordForm) {
      clientForm.has("language") &&
        externalRequestUrl.searchParams.append(
          "language",
          `${clientForm?.get("language")}`
        )
      clientForm.has("task_type") &&
        externalRequestUrl.searchParams.append(
          "task",
          `${clientForm?.get("task_type")}`
        )
      clientForm.has("model") &&
        externalRequestUrl.searchParams.append(
          "model",
          `${clientForm?.get("model")}`
        )
      if (clientForm.has("device"))
        externalRequestUrl.searchParams.append(
          "device",
          `${clientForm?.get("device")}`
        )
    }
    if (isRecordForm && isManualFileUpload)
      return NextResponse.json(
        [
          new Error("(1023): No se puede enviar ambos tipos de archivos."),
          null,
        ],
        {
          status: 400,
          statusText: "(1023): No se puede enviar ambos tipos de archivos.",
          headers,
        }
      )

    console.group(chalk.bold.blue("Form origin validation:"))
    console.log("isRecordForm:", isRecordForm)
    console.log("isManualFileUpload:", isManualFileUpload)
    console.groupEnd()

    // Reject if one of the parameters is missing when trying to upload from NAS
    if (isRecordForm && ((nasUrl && !fileName) || (!nasUrl && fileName)))
      return rejectResponse({ missingData: "NAS URL or fileName" })

    if (isRecordForm) {
      try {
        const binaryFromNAS = await fetchAudioData(nasUrl)
        const fileType = fileName.split(".").pop() || "octet-stream"
        const mimeType = `audio/${fileType}`
        const isValidMimeType = validateMimeType(mimeType)
        if (binaryFromNAS && isValidMimeType) {
          // Convert Buffer to Blob
          const blob = new Blob([binaryFromNAS], { type: mimeType })
          serverForm.set("file", blob, fileName)
        } else {
          const errorMessage = `(1006): ${!isValidMimeType ? "Tipo de archivo no soportado." : "Archivo no encontrado."}`
          return NextResponse.json([new Error(errorMessage), null], {
            status: !isValidMimeType ? 415 : 404,
            statusText: errorMessage,
            headers,
          })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error instanceof Error) {
          console.error(
            chalk.white.bgRed("Error posting audio to API:"),
            error.message
          )
          return NextResponse.json(
            [new Error("(1007): Error al crear la tarea."), null],
            {
              status: 500,
              statusText: "(1007): Error al crear la tarea.",
              headers,
            }
          )
        }
        return NextResponse.json(
          [new Error("(1008): Error desconocido al crear la tarea."), null],
          {
            status: 500,
            statusText: "(1008): Error desconocido al crear la tarea.",
            headers,
          }
        )
      }
    }

    // router rejects files larger than 50MB
    if (isManualFileUpload && file && file instanceof File) {
      if (file.size >= 50000000) {
        return NextResponse.json(
          ["(1021): El archivo proporcionado es demasiado grande.", null],
          {
            status: 413,
            statusText: "(1021): El archivo proporcionado es demasiado grande.",
            headers,
          }
        )
      }
      const mimeType = file.type
      const isValidMimeType = validateMimeType(mimeType)
      if (isValidMimeType) {
        serverForm.set("file", file)
      } else {
        return NextResponse.json(
          [new Error("(1022): Tipo de archivo no soportado."), null],
          {
            status: 415,
            statusText: "(1022): Tipo de archivo no soportado.",
            headers,
          }
        )
      }
    }
    console.log(
      `Sending task to API with URL ${chalk.bgBlack.white(externalRequestUrl.href)} and FormData`,
      serverForm
    )
    const [err, res] = await _post<TaskPOSTResponse>(
      externalRequestUrl.toString(),
      serverForm,
      undefined,
      {
        revalidate: true,
        expectJson: true,
      }
    )
    if (err !== null) {
      /**
       * If the error falls here, check if the API is running.
       */
      console.error(
        chalk.red(`Error encountered while sending data successfully to API:`),
        chalk.white(err.message)
      )
      return NextResponse.json(["(1009): Error al crear la tarea.", null], {
        status: 500,
        statusText: "(1009): Error al crear la tarea.",
        headers,
      })
    }
    return NextResponse.json([null, res], {
      status: 200,
      statusText: "Tarea creada",
      headers,
    })
  } catch (e) {
    return NextResponse.json([e, null], {
      status: 500,
      statusText: "(1020): Ha ocurrido un error inesperado.",
      headers,
    })
  }
}

export async function PUT(request: NextRequest) {
  const headers = await getHeaders(request)
  if (headers instanceof NextResponse) return headers
  const identifier = request.nextUrl.searchParams.get("identifier")
  const language = request.nextUrl.searchParams.get("language")
  if (!identifier) {
    return NextResponse.json(["ID was not provided", null], {
      status: 400,
      statusText: "ID was not provided",
      headers,
    })
  }
  /** Why are we using plural when updating a single task?
   * This took me much longer to debug than it should have... */
  const url = new URL(
    [env.API_CANARY_7000, ALL_TASKS_PATH, identifier].join("/")
  )
  if (language) url.searchParams.append("lang", `${language}`)
  const [err, res] = await _put<Response>(url.href, null)

  if (err) {
    console.error(
      `Error from API on ${url.href} PUT request:`,
      err.message.slice(0, 255)
    )
    return NextResponse.json(err?.message, {
      status: 500,
      statusText: "", // TODO: add a documented error message
      headers,
    })
  }

  if (res && res.ok) {
    const data = await res?.json()
    return NextResponse.json(data, {
      status: 200,
      headers,
    })
  }
  return NextResponse.json(null, {
    status: 404,
    statusText: "", // TODO: add a documented error message
    headers,
  })
}

export async function DELETE(req: NextRequest) {
  const headers = await getHeaders(req)
  if (headers instanceof NextResponse) return headers
  const id = req.nextUrl?.searchParams?.get("identifier")
  if (!id)
    return NextResponse.json(null, {
      status: 400,
      statusText: "Missing identifier", // TODO: add a documented error message
      headers,
    })
  const [err, res] = await _delete<NextResponse>(
    [env.API_MAIN, TASK_PATH, id].join("/")
  )
  if (err)
    return NextResponse.json(
      { id },
      {
        status: 404,
        statusText: "", // TODO: add a documented error message
        headers,
      }
    )
  if (res && res.status === 200)
    return NextResponse.json(
      { id },
      {
        status: 200,
        statusText: "Task deleted", // TODO: add a documented error message
        headers,
      }
    )
}
