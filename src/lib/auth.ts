"use server"
import { env } from "@/env"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const AUTH_COOKIE = "access_token"

export interface AuthTokens {
  access_token: string
  token_type: string
}

export async function setAuthCookie(tokens: AuthTokens) {
  const value = `${tokens.token_type} ${tokens.access_token}`

  cookies().set(AUTH_COOKIE, value, {
    // httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getAuthCookie(): Promise<string | undefined> {
  return cookies().get(AUTH_COOKIE)?.value
}

export async function removeAuthCookie(): Promise<void> {
  cookies().delete(AUTH_COOKIE)
  redirect("/login")
}

export async function isAuthenticated() {
  try {
    const authCookie = await getAuthCookie()

    const isExpired = await fetch(`${env.API_CANARY_8000}/users/me`, {
      headers: {
        Authorization: `${authCookie}`,
      },
    }).then(r => r.status !== 200)

    return Boolean(!isExpired)
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}
