"use client"
import { Button } from "@/components/ui/button"
import { IPAD_SIZE_QUERY } from "@/lib/consts"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { ArrowRight, LogIn } from "lucide-react"
import Link from "next/link"

export function LoginButton() {
  const isDesktop = useMediaQuery(IPAD_SIZE_QUERY)
  return (
    <Button
      variant='expandIcon'
      Icon={ArrowRight}
      iconPlacement='right'
      className='bg-popover text-popover-foreground border border-border overflow-hidden'
      size={!isDesktop ? "icon" : undefined}
    >
      <Link href='/login' className='w-full h-full'>
        {isDesktop ? "Iniciar Sesión" : <LogIn />}
      </Link>
    </Button>
  )
}

export function SignupButton() {
  return (
    <Button
      variant='expandIcon'
      Icon={ArrowRight}
      iconPlacement='right'
      asChild
    >
      <Link href='/signup'>Registrarse</Link>
    </Button>
  )
}
