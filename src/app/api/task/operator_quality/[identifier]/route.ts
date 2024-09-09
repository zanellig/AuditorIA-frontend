// import "server-only"
// import { NextRequest, NextResponse } from "next/server"
// import { _get } from "@/lib/fetcher"
// import { API_CANARY } from "@/lib/consts"

// export async function GET(request: NextRequest) {
//   const identifier = request.nextUrl.pathname.split("/").slice(-1)[0]
//   const url = `${API_CANARY}/task/operator_quality/${identifier}`
//   const [err, res] = await _get(url)
//   if (err !== null) {
//     return NextResponse.json(err)
//   }
//   return NextResponse.json(res)
// }
