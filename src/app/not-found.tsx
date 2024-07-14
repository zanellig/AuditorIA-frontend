"use client"

import ErrorScreen from "@/components/error-handlers/error-screen"

export default function NotFound() {
  const error = new Error("Página no encontrada...")
  return (
    <>
      <ErrorScreen
        error={error}
        reset={() => (window.location.href = "/dashboard")}
      />
    </>
  )
}

/** 
<div className='flex flex-col items-start justify-start max-w-2xl my-auto mx-auto pt-16'>
        
        <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
          ¡Ha ocurrido un error! 😯
        </h1>
        <p className='leading-7 [&:not(:first-child)]:mt-6'>
          Contacte a su administrador de IT y otorgue el siguiente código de
          error:
        </p>
        <br />
        <div>
          <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'>
            404
            <br />
            Página no encontrada...
          </code>
        </div>
      </div>

      */
