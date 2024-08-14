import { Method, FetchOptions } from "@/lib/types.d"

async function _request<T, R extends boolean | undefined = undefined>(
  url: string,
  method: Method,
  headers: Record<string, string>,
  body?: any,
  options?: { revalidate?: boolean; onlyReturnStatus?: boolean }
): Promise<R extends true ? number : T> {
  const fetchOptions: FetchOptions = {
    headers,
    method,
  }
  let response: Response

  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body
    } else {
      fetchOptions.body = JSON.stringify(body)
    }
  }

  if (options?.revalidate) {
    fetchOptions.next = { revalidate: 5 }
  }
  response = await fetch(url, fetchOptions)
  if (!response.ok) {
    const errorDetail = await response.json()
    console.error(
      `Error ${response.status}: ${response.statusText} - ${errorDetail.message}`
    )
  }

  if (options?.onlyReturnStatus) {
    return response.status as R extends true ? number : T
  }
  return (await response.json()) as R extends true ? number : T
}

function _get<T>(
  url: string,
  headers: Record<string, string>,
  options?: { revalidate?: boolean; onlyReturnStatus?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Get, headers, null, options)
}

function _post<T>(
  url: string,
  headers: Record<string, string>,
  body: any,
  options?: { revalidate?: boolean }
): Promise<T> {
  // console.log("POST:", {
  //   url,
  //   headers,
  //   body,
  //   options,
  // })
  return _request<T>(url, Method.Post, headers, body, options)
}

function _put<T>(
  url: string,
  headers: Record<string, string>,
  body: any,
  options?: { revalidate?: boolean }
): Promise<T> {
  if (body === null) {
    return _request<T>(url, Method.Put, headers, options)
  }
  return _request<T>(url, Method.Put, headers, body, options)
}

function _patch<T>(
  url: string,
  headers: Record<string, string>,
  body: any,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Patch, headers, body, options)
}

function _delete<T>(
  url: string,
  headers: Record<string, string>,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url + "/delete", Method.Delete, headers, null, options)
}

export { _request, _get, _post, _put, _patch, _delete }
