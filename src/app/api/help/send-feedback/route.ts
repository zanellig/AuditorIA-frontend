import { _get, _post, _put, _delete, _patch } from "@/lib/fetcher"
import { API_CANARY, FEEDBACK_PATH } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"

export const revalidate = 5

export async function POST(request: Request) {
  const headers = getHeaders(API_CANARY)
  const body = new FormData()
  const reqUrl = `${API_CANARY}/${FEEDBACK_PATH}`

  const response = await _post<any>(reqUrl, body, headers)

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": `${API_CANARY}`,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

/**
 *
 */
