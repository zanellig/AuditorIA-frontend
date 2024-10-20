import { _get, _post, _put } from "@/lib/fetcher"
import { SPEECH_TO_TEXT_PATH, TASK_PATH } from "@/server-constants"
import { AllowedContentTypes, getHeaders } from "@/lib/utils"
import { TaskPOSTResponse } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { fetchAudioData, getHost } from "@/lib/actions"
import { env } from "@/env"
import { validateMimeType } from "@/lib/forms"
import { SpeechToTextParams } from "./speech-to-text.d.js"
import { speechToTextSchema } from "./speech-to-text"

export const revalidate = 5

export async function GET(request: NextRequest) {
  const identifier = request.nextUrl.searchParams.get("identifier")

  const headers = getHeaders(env.API_MAIN, AllowedContentTypes.Json)
  if (!identifier) {
    return new NextResponse(
      JSON.stringify([
        new Error("1001: No se proporcionó un ID de tarea."),
        null,
      ]),
      {
        status: 400,
        headers: headers,
        statusText: "1001: No se proporcionó un ID de tarea.",
      }
    )
  }
  const reqUrl = [env.API_MAIN, TASK_PATH, identifier].join("/")
  const [err, res] = await _get(reqUrl, headers, {
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
    return new NextResponse(
      JSON.stringify([
        "(1002): Error interno desconocido al obtener la tarea.",
        null,
      ]),
      {
        status: 500,
        headers: headers,
        statusText: "(1002): Error interno desconocido al obtener la tarea.",
      }
    )
  }
  if (res === null) {
    return new NextResponse(
      JSON.stringify([new Error("(1003): Tarea no encontrada."), null]),
      {
        status: 404,
        headers: headers,
        statusText: "(1003): Tarea no encontrada.",
      }
    )
  }
  if (res !== null) {
    return new NextResponse(JSON.stringify([null, res]), {
      status: 200,
      headers: headers,
      statusText: "Tarea obtenida correctamente.",
    })
  }
  return new NextResponse(
    JSON.stringify([
      new Error("(1004): Error desconocido al obtener la tarea."),
      null,
    ]),
    {
      status: 500,
      headers: headers,
      statusText: "(1004): Error desconocido al obtener la tarea.",
    }
  )
}

export async function POST(request: NextRequest) {
  const responseHeaders = getHeaders(await getHost(), AllowedContentTypes.Json)
  const rejectResponse = ({ missingData }: { missingData?: string }) =>
    new NextResponse(
      JSON.stringify([
        `(1005): No se pudo ejecutar la consulta. ${missingData ? `${missingData} is missing.` : ""}`,
        null,
      ]),
      {
        status: 400,
        statusText: `(1005): No se pudo ejecutar la consulta. ${missingData ? `${missingData} is missing.` : ""}`,
        headers: responseHeaders,
      }
    )

  try {
    const params = request.nextUrl.searchParams
    const nasUrl = params.get("nasUrl")
    const fileName = params.get("fileName")
    const headers = getHeaders(env.API_MAIN, AllowedContentTypes.Multipart)
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
      clientForm.has("device") &&
        externalRequestUrl.searchParams.append(
          "device",
          `${clientForm?.get("device")}`
        )
    }
    if (isRecordForm && isManualFileUpload)
      return new NextResponse(
        JSON.stringify([
          new Error("(1023): No se puede enviar ambos tipos de archivos."),
          null,
        ]),
        {
          status: 400,
          statusText: "(1023): No se puede enviar ambos tipos de archivos.",
          headers: responseHeaders,
        }
      )

    console.group("Form origin validation:")
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
          return new NextResponse(
            JSON.stringify([new Error(errorMessage), null]),
            {
              status: !isValidMimeType ? 415 : 404,
              statusText: errorMessage,
              headers: responseHeaders,
            }
          )
        }
      } catch (error: any) {
        if (error instanceof Error) {
          console.error("Error posting audio to API:", error.message)
          return new NextResponse(
            JSON.stringify([
              new Error("(1007): Error al crear la tarea."),
              null,
            ]),
            {
              status: 500,
              statusText: "(1007): Error al crear la tarea.",
              headers: responseHeaders,
            }
          )
        }
        return new NextResponse(
          JSON.stringify([
            new Error("(1008): Error desconocido al crear la tarea."),
            null,
          ]),
          {
            status: 500,
            statusText: "(1008): Error desconocido al crear la tarea.",
            headers: responseHeaders,
          }
        )
      }
    }

    // router rejects files larger than 50MB
    if (isManualFileUpload && file && file instanceof File) {
      if (file.size >= 50000000) {
        return new NextResponse(
          JSON.stringify([
            "(1021): El archivo proporcionado es demasiado grande.",
            null,
          ]),
          {
            status: 413,
            statusText: "(1021): El archivo proporcionado es demasiado grande.",
            headers: responseHeaders,
          }
        )
      }
      const mimeType = file.type
      const isValidMimeType = validateMimeType(mimeType)
      if (isValidMimeType) {
        serverForm.set("file", file)
      } else {
        return new NextResponse(
          JSON.stringify([
            new Error("(1022): Tipo de archivo no soportado."),
            null,
          ]),
          {
            status: 415,
            statusText: "(1022): Tipo de archivo no soportado.",
            headers: responseHeaders,
          }
        )
      }
    }
    console.log(
      `Sending task to API with URL ${externalRequestUrl.href} and FormData`,
      serverForm
    )
    const [err, res] = await _post<TaskPOSTResponse>(
      externalRequestUrl.toString(),
      serverForm,
      headers,
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
        `Error encountered while sending data successfully to API:`,
        err.message
      )
      return new NextResponse(
        JSON.stringify(["(1009): Error al crear la tarea.", null]),
        {
          status: 500,
          statusText: "(1009): Error al crear la tarea.",
          headers: responseHeaders,
        }
      )
    }
    return new NextResponse(JSON.stringify([null, res]), {
      status: 200,
      statusText: "Tarea creada",
      headers: responseHeaders,
    })
  } catch (e) {
    return new NextResponse(JSON.stringify([e, null]), {
      status: 500,
      statusText: "(1020): Ha ocurrido un error inesperado.",
      headers: responseHeaders,
    })
  }
}

export async function PUT(request: NextRequest) {
  const responseHeaders = getHeaders(await getHost(), AllowedContentTypes.Json)
  const identifier = request.nextUrl.searchParams.get("identifier")
  const language = request.nextUrl.searchParams.get("language")
  if (!identifier) {
    return new NextResponse(
      JSON.stringify([
        new Error("ID was not provided", {
          cause: "Bad request",
        }),
        null,
      ]),
      { status: 400, headers: responseHeaders }
    )
  }
  const url = new URL([env.API_CANARY, TASK_PATH, identifier].join("/"))
  url.searchParams.append("lang", `${language}`)
  const headers = getHeaders(env.API_CANARY)
  console.log("URL OBJECT ON /api/task PUT request:", url)
  const [err, res] = await _put<Response>(url.href, null, headers)

  if (err) {
    console.error(`Error from API on ${url.href} PUT request:`, err.message)
    return new NextResponse(JSON.stringify(err?.message), {
      status: 500,
      statusText: "", // TODO: add a documented error message
      headers: responseHeaders,
    })
  }

  if (res && res.ok) {
    const data = await res?.json()
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: responseHeaders,
    })
  }
  return new NextResponse(JSON.stringify(null), {
    status: 404,
    statusText: "", // TODO: add a documented error message
    headers: responseHeaders,
  })
}
