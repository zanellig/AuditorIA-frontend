// lib/auth.ts
import { cookies } from "next/headers"

const AUTH_COOKIE = "auth_token"

export interface AuthTokens {
  access_token: string
  token_type: string
}

export function setAuthCookie(tokens: AuthTokens) {
  const cookieStore = cookies()
  const value = `${tokens.token_type} ${tokens.access_token}`

  return cookieStore.set({
    name: AUTH_COOKIE,
    value: value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function getAuthCookie(): string | undefined {
  const cookieStore = cookies()
  return cookieStore.get(AUTH_COOKIE)?.value
}

export function removeAuthCookie(): void {
  const cookieStore = cookies()
  cookieStore.delete(AUTH_COOKIE)
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getAuthCookie()
  return !!token
}
