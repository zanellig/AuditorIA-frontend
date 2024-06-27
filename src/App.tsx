import "@/styles/App.css"
import router from "@/router/Routes"

import { RouterProvider } from "react-router-dom"

function App() {
  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
