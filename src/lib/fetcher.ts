import { Method, FetchOptions } from "@/lib/types.d"

async function _request<T, R extends boolean | undefined = undefined>(
  url: string,
  method: Method,
  body?: any,
  headers?: Record<string, string>,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: boolean
    expectJson?: boolean
  }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  const fetchOptions: FetchOptions = {
    headers: headers || {},
    method,
  }
  let err: Error | null = null

  if (body && body instanceof FormData) {
    fetchOptions.body = body
  } else if (body !== null) {
    fetchOptions.body = JSON.stringify(body)
  }

  options?.revalidate ? (fetchOptions.next = { revalidate: 5 }) : null
  try {
    const res = await fetch(url, fetchOptions)

    !res.ok ? (err = await res.json()) : null

    if (options?.onlyReturnStatus) {
      return [err, res.status] as [null, R extends true ? number : T]
    }

    if (options?.expectJson) {
      return [err, await res.json()] as [null, R extends true ? number : T]
    }
    return [err, res] as [null, R extends true ? number : T]
  } catch (e) {
    return [e, null] as [Error, R extends true ? number : T]
  }
}

function _get(
  url: string,
  headers?: Record<string, string>,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: boolean
    expectJson?: boolean
  }
): Promise<[Error | null, Response | null]> {
  return _request(url, Method.Get, null, headers, options)
}

function _post<T, R extends boolean | undefined = undefined>(
  url: string,
  body: any,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean; onlyReturnStatus?: R; expectJson?: boolean }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Post, body, headers, options)
}

function _put<T, R extends boolean | undefined = undefined>(
  url: string,
  body: any,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean; onlyReturnStatus?: R; expectJson?: boolean }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Put, body, headers, options)
}

function _patch<T, R extends boolean | undefined = undefined>(
  url: string,
  body: any,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean; onlyReturnStatus?: R; expectJson?: boolean }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Patch, body, headers, options)
}

function _delete<T, R extends boolean | undefined = undefined>(
  url: string,
  headers?: Record<string, string>,
  options?: { revalidate?: boolean; onlyReturnStatus?: R; expectJson?: boolean }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Delete, null, headers, options)
}

export { _request, _get, _post, _put, _patch, _delete }
