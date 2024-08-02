"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import SubtitleH2 from "@/components/typography/subtitleH2"
import { ChevronRightIcon } from "@radix-ui/react-icons"
import { useState } from "react"

export default function EnvioDeTareas({ className }: { className?: string }) {
  const [isDeployed, changeDeployed] = useState(false)
  const TRANSITION_DURATION = "duration-300"

  return (
    <div
      className={cn(
        "bg-popover border z-50 self-center top-1/2 -translate-y-1/2 fixed flex flex-row rounded-md py-8 transition-all",
        TRANSITION_DURATION,
        className,
        isDeployed ? "right-2" : "-right-[370px]"
      )}
    >
      <DeployCardButton
        isDeployed={isDeployed}
        changeDeployed={changeDeployed}
      />

      <div
        className={cn(
          TRANSITION_DURATION,
          isDeployed ? "opacity-100" : "opacity-50"
        )}
      >
        <SubtitleH2>Subir archivos</SubtitleH2>
        {/* Esto tiene que ser un form */}
        <div className='pt-2 w-[350px] h-[600px]'>
          <Button
            onClick={() => {
              toast({
                title: "Se envió la tarea",
                description: "UUID-LOOKS-LIKE-THIS",
                action: (
                  <ToastAction altText='Copia el ID de la tarea enviada'>
                    Copiar ID
                  </ToastAction>
                ),
              })
            }}
          >
            Click me
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DeployCardButton({
  isDeployed,
  changeDeployed,
  className,
}: {
  isDeployed: boolean
  changeDeployed: Function
  className?: string
}) {
  return (
    <Button
      variant='ghost'
      className={cn(
        "hover:bg-background rounded-xl self-center transition-all py-16 px-2 mr-4 w-fit",
        className,
        "duration-500",
        isDeployed ? "opacity-100" : "opacity-50"
      )}
      onClick={e => {
        e.preventDefault()
        changeDeployed(!isDeployed)
      }}
    >
      <ChevronRightIcon
        className={cn(
          "transition-transform duration-500",
          isDeployed ? "rotate-0" : "rotate-180"
        )}
      />
    </Button>
  )
}
