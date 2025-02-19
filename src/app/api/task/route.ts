import {
  ALL_TASKS_PATH,
  SPEECH_TO_TEXT_PATH,
  TASK_PATH,
} from "@/server-constants"
import { NextRequest, NextResponse } from "next/server"
import { fetchAudioData } from "@/lib/actions"
import { env } from "@/env"
import { validateMimeType } from "@/lib/forms"
import { getHeaders } from "@/lib/get-headers"
import { enhanceUrlWithSpeechToTextParams } from "./utils"

export const revalidate = 5

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
    const identifier = request.nextUrl.searchParams.get("identifier")
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
    const response = await fetch(reqUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      /**
       * The ECONNREFUSED (Connection refused) could fall in this case if the server is not running, but we can't access that error message,
       * as far as I know.
       *
       * The message, stack, cause and name don't show anything useful, but if we log the error, we can see that the error message is
       * "ECONNREFUSED".
       */
      console.error(`${response.statusText}: ${response.status} on ${reqUrl}`)
      throw new Error(
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
        })
      )
    }
    const data = await response.json()
    return NextResponse.json([null, data], {
      status: 200,
      headers,
    })
  } catch (error) {
    const { status, statusText } = JSON.parse(error.message)
    return NextResponse.json([error, null], {
      status: status || 500,
      statusText: statusText || "Error al cargar la tarea",
      headers,
    })
  }
}
// TODO: Refactor with the bubble up pattern like the GET method
export async function POST(request: NextRequest) {
  const headers = await getHeaders(request)
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
    const clientForm = await request.formData().catch(e => {
      if (e) return null
    })
    if (!clientForm) return rejectResponse({ missingData: "Form" })

    /** The serverForm is used to send the file to the API. */
    const serverForm = new FormData()
    const externalRequestUrl = new URL(
      [env.API_MAIN, SPEECH_TO_TEXT_PATH].join("/")
    )
    const enhancedUrl = enhanceUrlWithSpeechToTextParams(
      externalRequestUrl.href,
      clientForm
    )

    const isRecordForm = !!(clientForm && nasUrl && fileName)
    const isManualFileUpload = !!(clientForm && !nasUrl && !fileName)

    // Seeing this, it would be much better to have two different endpoints, one for record and one for manual upload. Too much clutter and conditionals.

    if (isManualFileUpload && !clientForm?.has("file")) {
      return rejectResponse({ missingData: "File in FormData" })
    }
    const file = clientForm.get("file")

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

    // Reject if one of the parameters is missing when trying to upload from NAS
    if (isRecordForm && ((nasUrl && !fileName) || (!nasUrl && fileName))) {
      return rejectResponse({ missingData: "NAS URL or fileName" })
    }

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
        throw new Error(error.message)
      }
    }

    // router rejects files larger than 50MB
    if (isManualFileUpload && file && file instanceof File) {
      const FILE_SIZE_LIMIT = 50 * 1024 * 1024
      if (file.size >= FILE_SIZE_LIMIT) {
        return NextResponse.json(
          ["(1021): El archivo proporcionado es demasiado grande.", null],
          {
            status: 413,
            statusText: "(1021): El archivo proporcionado es demasiado grande.",
            headers,
          }
        )
      }
      const isValidMimeType = validateMimeType(file.type)
      if (isValidMimeType) {
        serverForm.set("file", file)
      } else {
        // I like the granularity of the error handling here, so we don't bubble the error up. I don't know if this is a good practice though.
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
      `Sending task to API with URL ${externalRequestUrl.href} and FormData`,
      serverForm
    )
    const response = await fetch(enhancedUrl.toString(), {
      method: "POST",
      body: serverForm,
    }).catch((e: TypeError) => {
      console.log(`Error sending task from ${enhancedUrl.toString()}:`, e.cause)
      throw new TypeError(
        "Ocurrió un error comunicándose con el servidor. Por favor contacte a su ingeniero de soporte."
      )
    })
    if (!response.ok) {
      console.log(response)
      const error = await response.json()
      throw new Error(error.detail)
    }
    const data = await response.json()
    console.log(`Data received from task API:`, data)
    if ("task" in data) {
      return NextResponse.json([null, data.task], {
        status: 200,
        headers,
      })
    }
    return NextResponse.json([null, data], {
      status: 200,
      headers,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json([e.message, null], {
      status: 500,
      headers,
    })
  }
}

export async function PUT(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
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
    // Revise API to update tasks correctly. I think this works like a POST to /analyze
    const response = await fetch(url.href, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: null,
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data = await response.json()
    return NextResponse.json(data, {
      status: 200,
      headers,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json([e, null], {
      status: 500,
      statusText: e.message,
      headers,
    })
  }
}

export async function DELETE(req: NextRequest) {
  const headers = await getHeaders(req)
  const id = req.nextUrl?.searchParams?.get("identifier")
  try {
    if (!id)
      return NextResponse.json(null, {
        status: 400,
        statusText: "Missing identifier", // TODO: add a documented error message
        headers,
      })

    const response = await fetch([env.API_MAIN, TASK_PATH, id].join("/"), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    console.log(data)
    return NextResponse.json(
      { id },
      {
        status: 200,
        statusText: "Task deleted",
        headers,
      }
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json(
      { id },
      {
        status: 500,
        headers,
      }
    )
  }
}
