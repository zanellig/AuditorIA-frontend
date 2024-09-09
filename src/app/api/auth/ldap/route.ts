import { NextResponse } from "next/server"
import { Client } from "ldapts"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  const client = new Client({
    url: process.env.LDAP_URL,
  })

  try {
    // Bind with the service account
    await client.bind(
      process.env.LDAP_BIND_DN,
      process.env.LDAP_BIND_CREDENTIALS
    )

    // Search for the user
    const searchFilter = process.env.LDAP_SEARCH_FILTER.replace(
      "{{username}}",
      username
    )
    const { searchEntries } = await client.search(
      process.env.LDAP_SEARCH_BASE,
      {
        scope: "sub",
        filter: searchFilter,
      }
    )

    if (searchEntries.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Attempt to bind with the user's credentials
    const userDN = searchEntries[0].dn
    await client.bind(userDN, password)

    // If we reach here, authentication was successful
    return NextResponse.json({
      success: true,
      message: "Authentication successful",
    })
  } catch (error) {
    console.error("LDAP authentication error:", error)
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 401 }
    )
  } finally {
    // Always unbind
    await client.unbind()
  }
}
