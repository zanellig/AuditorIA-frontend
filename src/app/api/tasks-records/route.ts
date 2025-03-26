import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"
import {
  TaskRecordsSearchParams,
  TasksRecordsInternalResponse,
  TasksRecordsResponse,
} from "@/lib/types"
import { env } from "@/env"
import redisClient from "@/lib/services/redisClient"

const CACHE_KEY = "tasks-records"
const CACHE_TTL_SECONDS = env.NODE_ENV === "production" ? 15 : 3600

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
    const sortBy = searchParams.get("sortBy") ?? null
    const sortOrder = searchParams.get("sortOrder") ?? "asc"

    const params = {
      uuid,
      file_name,
      status,
      user,
      campaign,
      globalSearch,
      sortBy,
      sortOrder,
    } as TaskRecordsSearchParams

    const page = parseInt(pageRequested)
    if (isNaN(page)) {
      throw new Error("Invalid page number")
    }

    // Try to read from cache first
    let tasksRecords: TasksRecordsResponse[] | [] = await getCachedData()

    // If cache is empty or invalid, fetch fresh data
    if (!tasksRecords?.length) {
      console.log("route /api/tasks-records: cache miss. Fetching fresh data")
      tasksRecords = await fetchFreshData()
      await updateCache(tasksRecords)
    } else {
      console.log("route /api/tasks-records: cache hit")
    }

    const filteredData = filterData(tasksRecords, params)

    const AMOUNT_OF_RECORDS_PER_PAGE = 10
    const startIndex = page * AMOUNT_OF_RECORDS_PER_PAGE
    const endIndex = startIndex + AMOUNT_OF_RECORDS_PER_PAGE

    // Apply pagination
    const currentPageData = filteredData.slice(startIndex, endIndex)
    const hasMoreData = endIndex < filteredData.length
    const totalPages = Math.ceil(
      filteredData.length / AMOUNT_OF_RECORDS_PER_PAGE
    )

    const data: TasksRecordsInternalResponse = {
      success: true,
      tasks: currentPageData,
      hasMore: hasMoreData,
      total: filteredData.length,
      pages: totalPages,
    }
    return NextResponse.json(data, {
      status: 200,
      headers,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500, statusText: e.message, headers }
    )
  }
}

async function getCachedData(): Promise<TasksRecordsResponse[] | []> {
  try {
    const cached = await redisClient.get(CACHE_KEY)
    if (cached) {
      // We store our data as a JSON string
      const parsed = JSON.parse(cached)
      return parsed.data
    }
  } catch (error) {
    console.error("Error reading from Redis", error)
  }
  return []
}

async function fetchFreshData(): Promise<TasksRecordsResponse[]> {
  const requestUrl = new URL(`${env.API_CANARY_8000}/tasks-records`)
  const response = await fetch(requestUrl.toString())
  const data = await response.json()
  return data.tasks
}

async function updateCache(data: TasksRecordsResponse[]): Promise<void> {
  try {
    const payload = JSON.stringify({ data })
    await redisClient.set(CACHE_KEY, payload, "EX", CACHE_TTL_SECONDS)
  } catch (error) {
    console.error("Error updating Redis cache", error)
  }
}

const filterData = (
  data: TasksRecordsResponse[],
  params: TaskRecordsSearchParams
) => {
  const matches = (
    value: string | number | null | undefined,
    filter: string | number | null | undefined
  ): boolean =>
    filter
      ? String(value).toLowerCase().includes(String(filter).toLowerCase())
      : true

  const filteredData = data.filter(task => {
    const matchesSpecificFilters =
      matches(task.uuid, params.uuid) &&
      matches(task.file_name, params.file_name) &&
      matches(task.status, params.status) &&
      matches(task.user, params.user) &&
      matches(task.campaign, params.campaign)

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

  // Apply sorting if sortBy parameter is provided
  if (params.sortBy) {
    filteredData.sort((a, b) => {
      const aValue = a[params.sortBy as keyof TasksRecordsResponse]
      const bValue = b[params.sortBy as keyof TasksRecordsResponse]

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1

      // Special handling for dates
      if (params.sortBy === "inicio") {
        const aDate = aValue ? new Date(aValue as string).getTime() : 0
        const bDate = bValue ? new Date(bValue as string).getTime() : 0
        return params.sortOrder === "desc" ? bDate - aDate : aDate - bDate
      }

      // Regular comparison for other types
      if (aValue < bValue) return params.sortOrder === "desc" ? 1 : -1
      if (aValue > bValue) return params.sortOrder === "desc" ? -1 : 1
      return 0
    })
  }

  return filteredData
}
