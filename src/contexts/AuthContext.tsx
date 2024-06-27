import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem("isAuthenticated")
    return storedAuth === "true"
  })

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString())
  }, [isAuthenticated])

  const login = (username: string, password: string) => {
    if (username === "user" && password === "password") {
      setIsAuthenticated(true)
      console.log("Login successful, isAuthenticated:", true)
      return true
    } else {
      alert("Invalid credentials")
      console.log("Login failed, isAuthenticated:", false)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
