import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import { getHeaders } from "@/lib/get-headers"
import { TaskRecordsResponse } from "@/components/tables/troublesome-tasks/types"
import { isAuthenticated } from "@/lib/auth"
import { unauthorizedResponse } from "../unauthorized"

export async function GET(request: NextRequest) {
  const authorized = await isAuthenticated()
  if (!authorized) {
    return unauthorizedResponse(request)
  }
  const headers = await getHeaders(request)
  try {
    const searchRequested = request.nextUrl.searchParams.get("search")
    const pageRequested = request.nextUrl.searchParams.get("page")
    const uuidRequested = request.nextUrl.searchParams.get("uuid")
    const fileNameRequested = request.nextUrl.searchParams.get("file_name")
    const statusRequested = request.nextUrl.searchParams.get("status")
    const userRequested = request.nextUrl.searchParams.get("user")
    const campaignRequested = request.nextUrl.searchParams.get("campaign")

    if (!pageRequested) {
      throw new Error("A page number must be provided to fetch data")
    }
    const page = parseInt(pageRequested)
    if (isNaN(page)) {
      throw new Error("Invalid page number")
    }

    const mockData = await fs.readFile(
      "public\\mock\\task-records.json",
      "utf8"
    )
    const mockJsonData: TaskRecordsResponse[] = JSON.parse(mockData).tasks

    const AMOUNT_OF_RECORDS_PER_PAGE = 10
    const startIndex = page * AMOUNT_OF_RECORDS_PER_PAGE
    const endIndex = startIndex + AMOUNT_OF_RECORDS_PER_PAGE

    let filteredData: TaskRecordsResponse[] = mockJsonData

    // Apply filters
    const filterData = (data: TaskRecordsResponse[]) => {
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

    // Apply filters to data
    filteredData = filterData(filteredData)

    // Apply pagination
    const currentPageData = filteredData.slice(startIndex, endIndex)
    const hasMoreData = endIndex < filteredData.length

    /* API is down
    const individualTaskRequests = currentPageData.map(async task => {
      const taskUrl = new URL(env.API_MAIN)
      taskUrl.pathname = `/task/${task.uuid}`
      return fetch(taskUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
    })

    const individualTaskResponses = await Promise.allSettled(
      individualTaskRequests
    )

    const enrichedData = currentPageData.map(async (task, index) => {
      const taskResponse = individualTaskResponses[index]
      if (taskResponse.status === "fulfilled") {
        const taskResponseData: Task = await taskResponse.value.json()
        console.log(taskResponseData)
        return {
          ...task,
          ...taskResponseData,
        }
      } else {
        return task
      }
    })
    */

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
