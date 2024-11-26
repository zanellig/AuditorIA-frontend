"use server"
import { env } from "@/env"
import { cookies } from "next/headers"

const AUTH_COOKIE = "session"

export interface AuthTokens {
  access_token: string
  token_type: string
}

export async function setAuthCookie(tokens: AuthTokens) {
  console.log("Setting auth cookie:", tokens)
  const value = `${tokens.token_type} ${tokens.access_token}`

  cookies().set(AUTH_COOKIE, value, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    expires: new Date(Date.now() + 60 * 60 * 1000),
  })
}

export async function getAuthCookie() {
  const session = cookies().get(AUTH_COOKIE)?.value
  if (!session) return null
  const [tokenType, accessToken] = session.split(" ")
  return { tokenType, accessToken }
}

export async function removeAuthCookie() {
  cookies().set(AUTH_COOKIE, "", { expires: new Date(0) })
}

export async function isAuthenticated() {
  let isAuthenticated = false
  try {
    const session = await getAuthCookie()
    if (!session) return false
    const { tokenType, accessToken } = session
    const isExpired = await fetch(`${env.API_CANARY_8000}/users/me`, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    }).then(r => r.status !== 200)

    isAuthenticated = Boolean(!isExpired)
  } catch (error) {
    console.error("Error checking authentication:", error)
    isAuthenticated = false
  }
  return isAuthenticated
}
