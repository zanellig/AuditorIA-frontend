"use client"
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react"

interface DashboardContextProps {
  isAdvanced: boolean
  toggleDashboard: () => void
}

const DashboardContext = createContext<DashboardContextProps | undefined>(
  undefined
)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("isAdvanced")
      return storedValue ? JSON.parse(storedValue) : false
    }
    return false
  })

  const toggleDashboard = () => {
    setIsAdvanced(prev => {
      const newValue = !prev
      localStorage.setItem("isAdvanced", JSON.stringify(newValue))
      return newValue
    })
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("isAdvanced")
      if (storedValue) {
        setIsAdvanced(JSON.parse(storedValue))
      }
    }
  }, [])

  return (
    <DashboardContext.Provider value={{ isAdvanced, toggleDashboard }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
