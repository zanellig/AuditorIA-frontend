import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { ThemeProvider } from "@/contexts/theme-provider.tsx"
import { AuthProvider } from "./contexts/AuthContext.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
