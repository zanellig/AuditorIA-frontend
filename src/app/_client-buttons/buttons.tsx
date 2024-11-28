"use client"
import { Button } from "@/components/ui/button"
import { GLOBAL_ICON_SIZE, IPAD_SIZE_QUERY } from "@/lib/consts"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { ArrowRight, LogIn } from "lucide-react"
import Link from "next/link"

export function LoginButton() {
  const isDesktop = useMediaQuery(IPAD_SIZE_QUERY)
  return (
    <Button
      variant={isDesktop ? "expandIcon" : "default"}
      Icon={ArrowRight}
      iconPlacement='right'
      className={cn(
        "bg-popover text-popover-foreground border border-border overflow-hidden",
        !isDesktop && "text-foreground"
      )}
      size={!isDesktop ? "icon" : "default"}
    >
      <Link href='/login' className='w-full h-full'>
        {isDesktop ? "Iniciar Sesión" : <LogIn size={GLOBAL_ICON_SIZE} />}
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
