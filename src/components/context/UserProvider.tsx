import React, { createContext, useContext, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"
import { blankImageUrl } from "@/lib/blank-image-blob"

interface UserContextType {
  userEmail: string
  username: string
  userFullName: string
  userAvatar: string
  userInitials: string
  getUserEmail: () => Promise<string>
  getUserName: () => Promise<string>
  getUserFullName: () => Promise<string>
  getUserAvatar: () => Promise<string>
  updateUserEmail: (email: string) => Promise<void>
  updateUserFullName: (fullName: string) => Promise<void>
  updateUserAvatar: (avatar: string) => Promise<void>
  refreshUser: () => Promise<void>
  refreshAvatar: () => Promise<void>
  removeUserData: () => Promise<void>
}

interface LocalUserData {
  userEmail: string
  username: string
  userFullName: string
}

const UserContext = createContext<UserContextType | null>(null)

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const queryClient = useQueryClient()

  // Base fetch function to handle API calls
  const fetchFromApi = useCallback(
    async (endpoint: string, options?: RequestInit) => {
      const host = new URL(await getHost())
      const response = await fetch(`${host.origin}/api/${endpoint}`, {
        ...options,
      })
      if (!response.ok) throw new Error("Algo salió mal, intenta de nuevo")
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        return response.json()
      }
      if (contentType?.includes("image")) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
      return response.text()
    },
    []
  )

  const { data: userData } = useQuery<LocalUserData>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetchFromApi("user")
      console.log("Respuesta de /api/user:", response)
      return response
    },
    enabled: true,
    refetchOnMount: true,
  })

  const { data: avatarData } = useQuery({
    queryKey: ["user", "avatar"],
    queryFn: () => fetchFromApi("avatar"),
    enabled: true,
    refetchOnMount: true,
  })

  // Individual getter queries

  const getUserEmail = useCallback(async () => {
    const cached = queryClient.getQueryData<LocalUserData>(["user"])
    if (cached?.userEmail) return cached.userEmail
    const data = await queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: () => fetchFromApi("user"),
    })
    return data.userEmail
  }, [queryClient, fetchFromApi])

  const getUserName = useCallback(async () => {
    const cached = queryClient.getQueryData<LocalUserData>(["user"])
    if (cached?.username) return cached.username
    const data = await queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: () => fetchFromApi("user"),
    })
    return data.username
  }, [queryClient, fetchFromApi])

  const getUserFullName = useCallback(async () => {
    const cached = queryClient.getQueryData<LocalUserData>(["user"])
    if (cached?.userFullName) return cached.userFullName
    const data = await queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: () => fetchFromApi("user"),
    })
    return data.userFullName
  }, [queryClient, fetchFromApi])

  const getUserAvatar = useCallback(async () => {
    const cached = queryClient.getQueryData<{ userAvatar: string }>([
      "user",
      "avatar",
    ])
    if (cached?.userAvatar) return cached.userAvatar
    const data = await queryClient.fetchQuery({
      queryKey: ["user", "avatar"],
      queryFn: () => fetchFromApi("avatar"),
    })
    console.log("Result of last resolver avatar query:", data)
    return data
  }, [queryClient, fetchFromApi])

  // Update mutations
  const updateUserEmail = useMutation({
    mutationFn: async (email: string) => {
      await fetchFromApi("user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  }).mutateAsync

  const updateUserFullName = useMutation({
    mutationFn: async (fullName: string) => {
      await fetchFromApi("user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  }).mutateAsync

  const updateUserAvatar = useMutation({
    mutationFn: async (avatar: string) => {
      await fetchFromApi("avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar }),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", "avatar"] })
    },
  }).mutateAsync

  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] })
  }

  const refreshAvatar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user", "avatar"] })
  }

  const removeUserData = async () => {
    await queryClient.resetQueries(
      { queryKey: ["user"], exact: true },
      { cancelRefetch: true }
    )
    await queryClient.resetQueries(
      { queryKey: ["user", "avatar"], exact: true },
      { cancelRefetch: true }
    )
  }

  const value = {
    // User data from initial query
    userEmail: userData?.userEmail ?? "",
    username: userData?.username ?? "",
    userFullName: userData?.userFullName ?? "",
    userAvatar: avatarData ?? blankImageUrl,
    userInitials: userData?.userFullName
      ? userData.userFullName
          .split(" ")
          .filter(word => word.length > 0)
          .map(word => word[0])
          .filter((_, index, arr) => index === 0 || index === arr.length - 1)
          .join("")
      : "",
    // Getter methods
    getUserEmail,
    getUserName,
    getUserFullName,
    getUserAvatar,
    // Update methods
    /** # WIP */
    updateUserEmail,
    /** # WIP */
    updateUserFullName,
    updateUserAvatar,
    refreshUser,
    refreshAvatar,
    removeUserData,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider")
  }
  return context
}
