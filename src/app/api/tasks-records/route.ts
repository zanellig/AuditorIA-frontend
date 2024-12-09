import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"
import {
  type TaskRecordsResponse,
  type TaskRecordsSearchParams,
} from "@/lib/types.d"
import { env } from "@/env"

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
    const searchParams = request.nextUrl.searchParams
    const pageRequested = searchParams.get("page") ?? "0"
    const uuidRequested = searchParams.get("uuid") ?? null
    const fileNameRequested = searchParams.get("file_name") ?? null
    const statusRequested = searchParams.get("status") ?? null
    const userRequested = searchParams.get("user") ?? null
    const campaignRequested = searchParams.get("campaign") ?? null
    // not implemented in API
    const searchRequested = searchParams.get("search") ?? null

    const params = {
      uuid: uuidRequested,
      file_name: fileNameRequested,
      status: statusRequested,
      user: userRequested,
      campaign: campaignRequested,
      globalSearch: searchRequested,
    }

    const page = parseInt(pageRequested)
    if (isNaN(page)) {
      throw new Error("Invalid page number")
    }
    const requestUrl = new URL(`${env.API_CANARY_8000}/tasks-records`)
    // for (const [key, value] of searchParams.entries()) {
    //   requestUrl.searchParams.set(key, value)
    // }
    const tasksRecords: TaskRecordsResponse[] = await fetch(
      requestUrl.toString(),
      { next: { revalidate: 10 } }
    ).then(async res => {
      const data = await res.json()
      return data.tasks
    })

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

const filterData = (
  data: TaskRecordsResponse[],
  params: TaskRecordsSearchParams
) => {
  const {
    uuid: uuidRequested,
    file_name: fileNameRequested,
    status: statusRequested,
    user: userRequested,
    campaign: campaignRequested,
    globalSearch: searchRequested,
  } = params
  const matches = (
    value: string | null | undefined,
    filter: string | null | undefined
  ): boolean =>
    filter
      ? String(value).toLowerCase().includes(String(filter).toLowerCase())
      : true

  return data.filter(task => {
    const matchesSpecificFilters =
      matches(task.uuid, uuidRequested) &&
      matches(task.file_name, fileNameRequested) &&
      matches(task.status?.toString(), statusRequested) &&
      matches(task.user?.toString(), userRequested) &&
      matches(task.campaign?.toString(), campaignRequested)

    const matchesGlobalSearch =
      searchRequested &&
      !searchRequested.includes("null") &&
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
          field!.toLowerCase().includes(searchRequested.toLowerCase())
        )

    // Apply specific filters if any are provided
    if (
      uuidRequested ||
      fileNameRequested ||
      statusRequested ||
      userRequested ||
      campaignRequested
    ) {
      return matchesSpecificFilters
    }

    // Apply global search if no specific filters are used
    if (searchRequested) {
      return matchesGlobalSearch
    }

    // If no filters or search terms are provided, include all data
    return true
  })
}
