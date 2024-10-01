"use client"
import { Button } from "@/components/ui/button"
import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
export default function NotFoundPage() {
  const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center h-dvh space-y-4'>
      <div className='flex items-center space-x-2'>
        <h1 className='text-2xl font-bold border-r-2 pr-2'>404</h1>
        <span className='text-2xl'>Página no encontrada</span>
      </div>
      <Button variant='outline' onClick={() => router.back()}>
        <ArrowLeft className='mr-2' size={GLOBAL_ICON_SIZE} />
        Volver
      </Button>
    </div>
  )
}
