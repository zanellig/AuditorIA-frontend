import { Method, FetchOptions } from "@/lib/types.d"

async function _request<T, R extends boolean | undefined = undefined>(
  url: string,
  method: Method,
  body?: any,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean; onlyReturnStatus?: boolean }
): Promise<R extends true ? number : T> {
  const fetchOptions: FetchOptions = {
    headers: headers || {},
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
  console.log(`fetchOptions: `, fetchOptions, "\nurl: ", url)
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
  return await response.json()
}

function _get<T>(
  url: string,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean; onlyReturnStatus?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Get, null, headers, options)
}

function _post<T>(
  url: string,
  body: any,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean }
): Promise<T> {
  // console.log("POST:", {
  //   url,
  //   headers,
  //   body,
  //   options,
  // })
  return _request<T>(url, Method.Post, body, headers, options)
}

function _put<T>(
  url: string,
  body: any,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean }
): Promise<T> {
  if (body === null) {
    return _request<T>(url, Method.Put, null, headers, options)
  }
  return _request<T>(url, Method.Put, body, headers, options)
}

function _patch<T>(
  url: string,
  body: any,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url, Method.Patch, body, headers, options)
}

function _delete<T>(
  url: string,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean }
): Promise<T> {
  return _request<T>(url + "/delete", Method.Delete, null, headers, options)
}

export { _request, _get, _post, _put, _patch, _delete }
