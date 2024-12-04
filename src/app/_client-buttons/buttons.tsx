"use client"
import { LinkButton } from "@/components/link-button"
import { ArrowRight, LogIn } from "lucide-react"

export function LoginButton() {
  return (
    <LinkButton
      href='/login'
      variant='expandIcon'
      Icon={ArrowRight}
      iconPlacement='right'
    >
      <>
        <span className='hidden lg:block'>Iniciar sesión</span>
        <LogIn size={19} className='block lg:hidden' />
      </>
    </LinkButton>
  )
}
