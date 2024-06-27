import "@/styles/App.css"
import router from "@/router/Routes"

import { RouterProvider } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  )
}

export default App
