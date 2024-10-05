import { _get, _post } from "@/lib/fetcher"
import { TASK_PATH } from "@/server-constants"
import { AllowedContentTypes, getHeaders } from "@/lib/utils"
import { TaskPOSTResponse } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { fetchAudioData } from "@/lib/actions"
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
  if (res.ok) {
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
  const params = request.nextUrl.searchParams
  const headers = getHeaders(env.API_MAIN)
  const form = await request.formData()
  const nasUrl = params.get("nasUrl")
  const fileName = params.get("fileName")
  const responseHeaders = getHeaders(env.API_MAIN, AllowedContentTypes.Json)
  console.group("Request reached endpoint /api/task with the following data:")
  console.log("nasUrl:", nasUrl)
  console.log("fileName:", fileName)
  console.log("data:", form)
  console.groupEnd()
  const rejectCondition =
    !form ||
    !form.get("language") ||
    !form.get("task_type") ||
    !form.get("model") ||
    !form.get("device")
  if (rejectCondition) {
    return new NextResponse(
      JSON.stringify([
        new Error(
          "(1005): No se han proveído los datos necesarios para ejecutar la consulta."
        ),
        null,
      ]),
      {
        status: 400,
        statusText:
          "(1005): No se han proveído los datos necesarios para ejecutar la consulta.",
        headers: responseHeaders,
      }
    )
  }
  if (nasUrl && fileName) {
    try {
      const binaryFromNAS = await fetchAudioData(nasUrl)
      const fileType = fileName.split(".").pop() || "octet-stream"
      if (binaryFromNAS) {
        // Convert Buffer to Blob
        const blob = new Blob([binaryFromNAS], { type: `audio/${fileType}` })
        form.set("file", blob, fileName)
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
          JSON.stringify([new Error("(1007): Error al crear la tarea."), null]),
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
  const [err, res] = await _post<TaskPOSTResponse>(
    [env.API_MAIN, TASK_PATH].join("/"),
    form,
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
}
