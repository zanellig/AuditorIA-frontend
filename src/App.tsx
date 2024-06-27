import "@/styles/App.css"

import Navbar from "@/components/Navbar"
import Login from "@/components/Login"

function App() {
  return (
    <>
      {/* if authenticated */}
      {(false && <Login />) || (
        <div className="p-4 w-full flex flex-row justify-between">
          <a href="/" className="text-xl font-italic font-bold">
            AuditorIA
          </a>
          <Navbar />
        </div>
      )}
      {/* else */}
    </>
  )
}

export default App
