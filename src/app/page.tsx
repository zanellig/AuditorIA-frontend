"use client"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <>
      <h2 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
        ACA IRÍA LA LANDING QUE HIZO FEDE
      </h2>
      <h1>Pagina principal</h1>
      <Button
        onClick={e => {
          e.preventDefault()
          window.location.href = "/dashboard"
        }}
      >
        Accede al dashboard
      </Button>
    </>
  )
}

// TODO: <DONE!> Hacer dinámica la ruta donde se encuentren los audios
// TODO?: Cargar lista de campañas para automatizar transcripción y análisis de sentiment
