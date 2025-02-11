import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"
import {
  type TaskRecordsResponse,
  type TaskRecordsSearchParams,
} from "@/lib/types.d"
import { env } from "@/env"
// Only for caching purposes
import * as fs from "fs/promises"
import path from "path"

const CACHE_DIR = path.join(process.cwd(), "cache")
const CACHE_FILE = path.join(CACHE_DIR, "tasks-records.json")
const CACHE_TTL = 10 * 1000 // 10 seconds

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
    const searchParams = request.nextUrl.searchParams
    const pageRequested = searchParams.get("page") ?? "0"
    const uuid = searchParams.get("uuid") ?? null
    const file_name = searchParams.get("file_name") ?? null
    const status = searchParams.get("status") ?? null
    const user = searchParams.get("user") ?? null
    const campaign = searchParams.get("campaign") ?? null
    // not implemented in API
    const globalSearch = searchParams.get("search") ?? null

    const params = {
      uuid,
      file_name,
      status,
      user,
      campaign,
      globalSearch,
    } as TaskRecordsSearchParams

    const page = parseInt(pageRequested)
    if (isNaN(page)) {
      throw new Error("Invalid page number")
    }

    // Try to read from cache first
    let tasksRecords: TaskRecordsResponse[] = await getCachedData()

    // If cache is empty or invalid, fetch fresh data
    if (!tasksRecords.length) {
      tasksRecords = await fetchFreshData()
      await updateCache(tasksRecords)
    }

    const filteredData = filterData(tasksRecords, params)

    const AMOUNT_OF_RECORDS_PER_PAGE = 10
    const startIndex = page * AMOUNT_OF_RECORDS_PER_PAGE
    const endIndex = startIndex + AMOUNT_OF_RECORDS_PER_PAGE

    // Apply pagination
    const currentPageData = filteredData.slice(startIndex, endIndex)
    const hasMoreData = endIndex < filteredData.length

    const data = {
      tasks: currentPageData,
      hasMore: hasMoreData,
      total: filteredData.length,
    }
    return NextResponse.json(data, {
      status: 200,
      headers,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500, headers })
  }
}

async function getCachedData(): Promise<TaskRecordsResponse[]> {
  try {
    await fs.access(CACHE_FILE)
    const cacheContent = await fs.readFile(CACHE_FILE, "utf-8")
    const cache = JSON.parse(cacheContent)

    if (Date.now() - cache.timestamp <= CACHE_TTL) {
      return cache.data
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Cache doesn't exist or is invalid
  }
  return []
}

async function fetchFreshData(): Promise<TaskRecordsResponse[]> {
  const requestUrl = new URL(`${env.API_CANARY_8000}/tasks-records`)
  const response = await fetch(requestUrl.toString())
  const data = await response.json()
  return data.tasks
}

async function updateCache(data: TaskRecordsResponse[]): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true })
  await fs.writeFile(
    CACHE_FILE,
    JSON.stringify({
      timestamp: Date.now(),
      data: data,
    })
  )
}

const filterData = (
  data: TaskRecordsResponse[],
  params: TaskRecordsSearchParams
) => {
  const matches = (
    value: string | null | undefined,
    filter: string | null | undefined
  ): boolean =>
    filter
      ? String(value).toLowerCase().includes(String(filter).toLowerCase())
      : true

  return data.filter(task => {
    const matchesSpecificFilters =
      matches(task.uuid, params.uuid) &&
      matches(task.file_name, params.file_name) &&
      matches(task.status?.toString(), params.status) &&
      matches(task.user?.toString(), String(params.user)) &&
      matches(task.campaign?.toString(), String(params.campaign))

    const matchesGlobalSearch =
      params.globalSearch &&
      !params.globalSearch.includes("null") &&
      [
        task.uuid,
        task.file_name,
        task.status?.toString(),
        task.user?.toString(),
        task.campaign?.toString(),
      ]
        .filter(Boolean) // Remove null/undefined entries
        .some(field =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          field!
            .toLowerCase()
            .includes(String(params.globalSearch).toLowerCase())
        )

    // Apply specific filters if any are provided
    if (
      params.uuid ||
      params.file_name ||
      params.status ||
      params.user ||
      params.campaign
    ) {
      return matchesSpecificFilters
    }

    // Apply global search if no specific filters are used
    if (params.globalSearch) {
      return matchesGlobalSearch
    }

    // If no filters or search terms are provided, include all data
    return true
  })
}
