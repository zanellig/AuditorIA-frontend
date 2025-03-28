import { Suspense, useEffect } from "react"

import { usePostHog } from "posthog-js/react"

import { useSearchParams } from "next/navigation"

import { usePathname } from "next/navigation"

import { useUser } from "@/components/context/UserProvider"

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const user = useUser()
  // Track identified pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString()
      }

      posthog.capture("$pageview", {
        $current_url: url,
        username: user?.username,
        email: user?.userEmail,
        full_name: user?.userFullName,
      })
    }
  }, [pathname, searchParams, posthog, user])

  return null
}

export function IdentifiedPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
