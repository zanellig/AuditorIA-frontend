import { ALL_TASKS_PATH } from "@/server-constants"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHeaders } from "@/lib/get-headers"
// import fs from "fs/promises"
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}
// TODO: refactor this route. It's a mess.
export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
    const url = [
      env.API_MAIN,
      ALL_TASKS_PATH,
      //  "/not_valid_endpoint" // Uncomment to force 404 on server
    ].join("/")
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    /**
     * If you want to use the mock data, uncomment the following lines and comment the lines below.
     */
    // const mockTasks = await fs.readFile("./public/mock/updated_tasks.json")
    // return NextResponse.json(
    //   [null, mockTasks ? JSON.parse(mockTasks.toString()) : []],
    //   {
    //     status: 200,
    //     headers,
    //     statusText: "Mock",
    //   }
    // )

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data = await response.json()
    if ("tasks" in data) {
      return NextResponse.json([null, data.tasks], {
        status: 200,
        headers,
      })
    }
    return NextResponse.json([null, data], {
      status: 200,
      headers,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json([e, null], {
      status: 500,
      statusText: e.message,
      headers,
    })
  }
}
