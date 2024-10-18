import { _get, _post, _put } from "@/lib/fetcher"
import { TASK_PATH } from "@/server-constants"
import { AllowedContentTypes, getHeaders } from "@/lib/utils"
import { TaskPOSTResponse } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { fetchAudioData, getHost } from "@/lib/actions"
import { env } from "@/env"

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
  try {
    const params = request.nextUrl.searchParams
    const headers = getHeaders(env.API_MAIN)
    const clientForm = await request.formData().catch(e => {
      if (e) {
        return null
      }
    })
    /**
     * The serverForm is used to send the file to the API.
     */
    const serverForm = new FormData()
    const nasUrl = params.get("nasUrl")
    const fileName = params.get("fileName")
    const rejectResponse = ({
      missingData = "Some",
    }: {
      missingData?: string
    }) =>
      new NextResponse(
        JSON.stringify([
          new Error(
            `(1005): No se pudo ejecutar la consulta. ${missingData} data is missing.`
          ),
          null,
        ]),
        {
          status: 400,
          statusText: `(1005): No se pudo ejecutar la consulta. ${missingData} data is missing.`,
          headers: responseHeaders,
        }
      )

    if (!clientForm) {
      return rejectResponse({ missingData: "Form" })
    }

    const rejectCondition =
      !clientForm.get("language") ||
      !clientForm.get("task_type") ||
      !clientForm.get("model") ||
      !clientForm.get("device")

    if (rejectCondition) {
      return rejectResponse({ missingData: "Form fields" })
    }

    const languageParam = `${clientForm.get("language")}`
    const taskTypeParam = `${clientForm.get("task_type")}`
    const modelParam = `${clientForm.get("model")}`
    const deviceParam = `${clientForm.get("device")}`

    const externalRequestUrl = new URL([env.API_MAIN, TASK_PATH].join("/"))
    externalRequestUrl.searchParams.append("language", languageParam)
    externalRequestUrl.searchParams.append("task_type", taskTypeParam)
    externalRequestUrl.searchParams.append("model", modelParam)
    externalRequestUrl.searchParams.append("device", deviceParam)

    // Reject if one of the parameters is missing when trying to upload from NAS
    if ((nasUrl && !fileName) || (!nasUrl && fileName)) {
      return rejectResponse({ missingData: "File URL or fileName" })
    }

    if (nasUrl && fileName) {
      try {
        const binaryFromNAS = await fetchAudioData(nasUrl)
        const fileType = fileName.split(".").pop() || "octet-stream"
        if (binaryFromNAS) {
          // Convert Buffer to Blob
          const blob = new Blob([binaryFromNAS], { type: `audio/${fileType}` })
          serverForm.set("file", blob, fileName)
        } else {
          return new NextResponse(
            JSON.stringify([new Error("(1006): Archivo no encontrado."), null]),
            {
              status: 404,
              statusText: "(1006): Archivo no encontrado.",
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

    if (!clientForm.has("file")) {
      return rejectResponse({ missingData: "Attached file in form" })
    }

    const file = clientForm.get("file")
    // router rejects files larger than 50MB
    if (file && file instanceof File) {
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

      serverForm.set("file", file)
    } else {
      return new NextResponse(
        JSON.stringify([
          new Error("(1009): No se ha proporcionado un archivo para subir."),
          null,
        ]),
        {
          status: 400,
          statusText: "(1009): No se ha proporcionado un archivo para subir.",
          headers: responseHeaders,
        }
      )
    }

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
