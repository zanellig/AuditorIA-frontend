"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function LoginButton() {
  return (
    <Button
      variant='expandIcon'
      Icon={ArrowRight}
      iconPlacement='right'
      className='bg-popover text-popover-foreground border border-border overflow-hidden'
    >
      <Link href='/login'>Iniciar Sesión</Link>
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
