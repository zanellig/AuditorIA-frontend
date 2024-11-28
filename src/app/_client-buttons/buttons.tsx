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
      variant={"expandIcon"}
      Icon={ArrowRight}
      iconPlacement='right'
      asChild
      // className={cn(
      //   "bg-popover text-popover-foreground border border-border",
      //   !isDesktop && "text-foreground flex justify-center items-center",
      //   isDesktop && "overflow-hidden"
      // )}
      className={cn("bg-popover text-inherit border")}
      size={!isDesktop ? "icon" : undefined}
    >
      <Link href='/login'>
        {isDesktop ? "Iniciar Sesión" : <LogIn size={19} />}
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
