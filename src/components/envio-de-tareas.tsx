"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import SubtitleH2 from "./typography/subtitleH2"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { useState } from "react"

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

export default function EnvioDeTareas({ className }: { className?: string }) {
  const [isDeployed, changeDeployed] = useState(true)

  return (
    <div
      className={cn(
        "bg-popover z-50 self-center top-1/2 -translate-y-1/2 fixed flex flex-row rounded-md py-8 transition-all duration-500",
        className,
        isDeployed ? "right-2" : "-right-[350px]"
      )}
    >
      <DeployCardButton
        isDeployed={isDeployed}
        changeDeployed={changeDeployed}
      />
      <div
        className={cn(
          "duration-500",
          isDeployed ? "opacity-100" : "opacity-50"
        )}
      >
        <SubtitleH2>Subir archivos</SubtitleH2>
        <Card className='w-[350px] h-[600px]'>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
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
      className={cn("rounded-xl mr-2 self-center", className)}
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
