import React, { createContext, useContext, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"

interface UserContextType {
  userEmail: string
  username: string
  userFullName: string
  userAvatar: string
  getUserEmail: () => Promise<string>
  getUserName: () => Promise<string>
  getUserFullName: () => Promise<string>
  getUserAvatar: () => Promise<string>
  updateUserEmail: (email: string) => Promise<void>
  updateUserFullName: (fullName: string) => Promise<void>
  updateUserAvatar: (avatar: string) => Promise<void>
  refreshUser: () => Promise<void>
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
      return response.json()
    },
    []
  )

  const { data: userData } = useQuery<LocalUserData>({
    queryKey: ["user"],
    queryFn: () => fetchFromApi("/user"),
    enabled: true,
  })

  const { data: avatarData } = useQuery({
    queryKey: ["user", "avatar"],
    queryFn: () => fetchFromApi("/avatar"),
  })

  // Individual getter queries

  const getUserEmail = useCallback(async () => {
    const cached = queryClient.getQueryData<LocalUserData>(["user"])
    if (cached?.userEmail) return cached.userEmail
    const data = await queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: () => fetchFromApi("/user"),
    })
    return data.userEmail
  }, [queryClient, fetchFromApi])

  const getUserName = useCallback(async () => {
    const cached = queryClient.getQueryData<LocalUserData>(["user"])
    if (cached?.username) return cached.username
    const data = await queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: () => fetchFromApi("/user"),
    })
    return data.username
  }, [queryClient, fetchFromApi])

  const getUserFullName = useCallback(async () => {
    const cached = queryClient.getQueryData<LocalUserData>(["user"])
    if (cached?.userFullName) return cached.userFullName
    const data = await queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: () => fetchFromApi("/user"),
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
      queryFn: () => fetchFromApi("/avatar"),
    })
    return data.userAvatar
  }, [queryClient, fetchFromApi])

  // Update mutations
  const updateUserEmail = useMutation({
    mutationFn: async (email: string) => {
      await fetchFromApi("/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  }).mutateAsync

  const updateUserFullName = useMutation({
    mutationFn: async (fullName: string) => {
      await fetchFromApi("/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  }).mutateAsync

  const updateUserAvatar = useMutation({
    mutationFn: async (avatar: string) => {
      await fetchFromApi("/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "avatar"] })
    },
  }).mutateAsync

  const refreshUser = async () => {
    queryClient.cancelQueries({ queryKey: ["user"] })
    queryClient.refetchQueries({ queryKey: ["user"] })
  }

  const value = {
    // User data from initial query
    userEmail: userData?.userEmail ?? "",
    username: userData?.username ?? "",
    userFullName: userData?.userFullName ?? "",
    userAvatar: avatarData?.userAvatar ?? "",
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
