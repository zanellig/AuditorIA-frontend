import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom"
import AudiosNeotel from "@/pages/AudiosNeotel"
import Transcribir from "@/pages/Transcribir"
import Tareas from "@/pages/Tareas"
import Vistas from "@/pages/Vistas"
import NotFound from "@/pages/NotFound"
import LoginScreen from "@/pages/LoginScreen"
import RegisterScreen from "@/pages/RegisterScreen"
import Layout from "@/layouts/Layout"
import ProtectedRoute from "@/router/ProtectedRoute"

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route path="/audios-neotel" element={<AudiosNeotel />} />
          <Route path="/transcribir" element={<Transcribir />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/vistas" element={<Vistas />} />
        </Route>
      </Route>
    </>
  )
)

export default router
