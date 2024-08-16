import { _get, _post, _put, _delete, _patch } from "@/lib/fetcher"
import { URL_API_MAIN, TASK_PATH } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"

export const revalidate = 5

export async function GET(request: Request) {
  const url = new URL(request.url)
  console.log(url)
  const identifier = url.searchParams.get("identifier")
  const headers = getHeaders(URL_API_MAIN)

  if (!identifier) {
    return new Response("Task ID not found", { status: 400 })
  }
  const reqUrl = `${URL_API_MAIN}/${TASK_PATH}/${identifier}`

  const response = await _get<any>(reqUrl, headers)

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": url.origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
