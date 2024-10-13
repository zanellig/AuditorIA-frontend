import "server-only"
import { Method, FetchOptions } from "@/lib/types.d"

async function _request<T, R extends boolean | undefined = undefined>(
  url: string,
  method: Method,
  body?: any,
  headers?: Headers,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: boolean
    expectJson?: boolean
    cacheResponse?: boolean
  }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  const fetchOptions: FetchOptions = {
    headers:
      headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : headers || {},
    method,
  }
  let err: Error | null = null

  if (options?.cacheResponse !== undefined && !options?.cacheResponse) {
    fetchOptions.cache = "no-store" as RequestCache
  }

  if (body && body instanceof FormData) {
    fetchOptions.body = body
  } else if (body !== null) {
    fetchOptions.body = JSON.stringify(body)
  }

  options?.revalidate ? (fetchOptions.next = { revalidate: 5 }) : null
  try {
    const res = await fetch(url, fetchOptions)
    if (!res.ok) {
      try {
        err = await res.json()
      } catch (e) {
        err = new Error("Failed to parse error response", { cause: e })
      }
      return [err, null] as [Error, R extends true ? number : T]
    }
    if (err !== null) {
      return [err as Error, null] as [Error, R extends true ? number : T]
    }
    if (options?.onlyReturnStatus) {
      return [err, res.status] as [null, R extends true ? number : T]
    }
    if (options?.expectJson) {
      return [err, await res.json()] as [null, R extends true ? number : T]
    }
    return [err, res] as [null, R extends true ? number : T]
  } catch (e) {
    return [new Error("Failed to fetch", { cause: e }), null] as [
      Error,
      R extends true ? number : T,
    ]
  }
}

function _get(
  url: string,
  headers?: Headers,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: boolean
    expectJson?: boolean
    cacheResponse?: boolean
  }
): Promise<[Error | null, Response | null]> {
  return _request(url, Method.Get, null, headers, options)
}

function _post<T, R extends boolean | undefined = undefined>(
  url: string,
  body: any,
  headers?: Headers,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: R
    expectJson?: boolean
    cacheResponse?: boolean
  }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Post, body, headers, options)
}

function _put<T, R extends boolean | undefined = undefined>(
  url: string,
  body: any,
  headers?: Headers,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: R
    expectJson?: boolean
    cacheResponse?: boolean
  }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Put, body, headers, options)
}

function _patch<T, R extends boolean | undefined = undefined>(
  url: string,
  body: any,
  headers?: Headers,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: R
    expectJson?: boolean
    cacheResponse?: boolean
  }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Patch, body, headers, options)
}

function _delete<T, R extends boolean | undefined = undefined>(
  url: string,
  headers?: Headers,
  options?: {
    revalidate?: boolean
    onlyReturnStatus?: R
    expectJson?: boolean
    cacheResponse?: boolean
  }
): Promise<[Error | null, R extends true ? number : T | Response | null]> {
  return _request<T, R>(url, Method.Delete, null, headers, options)
}

export { _request, _get, _post, _put, _patch, _delete }
