"use server"
import { env } from "@/env"
import { cookies } from "next/headers"

const AUTH_COOKIE = "session"
const REDIRECT_COOKIE_NAME = "redirect_path"

export interface AuthTokens {
  access_token: string
  token_type: string
}

export async function setAuthCookie(tokens: AuthTokens) {
  const cstore = await cookies()
  const value = `${tokens.token_type} ${tokens.access_token}`
  cstore.set(AUTH_COOKIE, value, {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + 120 * 60 * 1000),
  })
}

export async function getAuthCookie() {
  const cstore = await cookies()
  const session = cstore.get(AUTH_COOKIE)?.value
  if (!session) return null
  const [tokenType, accessToken] = session.split(" ")
  return { tokenType, accessToken }
}

export async function removeAuthCookie() {
  const cstore = await cookies()
  cstore.set(AUTH_COOKIE, "", { expires: new Date(0) })
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
    })
      .then(r => r.status !== 200)
      .catch(e => false)

    isAuthenticated = Boolean(!isExpired)
  } catch (error) {
    console.error("Error checking authentication:", error)
    isAuthenticated = false
  }
  return isAuthenticated
}

export async function setRedirectPathCookie(path: string) {
  const cstore = await cookies()
  cstore.set(REDIRECT_COOKIE_NAME, path, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 60 * 5, // 5 minutes
    path: "/",
  })
}

export async function getRedirectPathCookie() {
  const cstore = await cookies()
  return cstore.get(REDIRECT_COOKIE_NAME)?.value || "/dashboard"
}

export async function clearRedirectPathCookie() {
  const cstore = await cookies()
  cstore.set(REDIRECT_COOKIE_NAME, "", { expires: new Date(0) })
}
