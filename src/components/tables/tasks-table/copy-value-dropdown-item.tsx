"use client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export function CopyValueDropdownItem({
  value,
  label,
  showToast,
  onClick,
}: {
  value: string | string[]
  label: string
  showToast?: boolean
  onClick?: () => void
}) {
  const { toast } = useToast()
  const textToCopy = typeof value === "string" ? value : value.join(", ")
  return (
    <DropdownMenuItem
      onClick={() => {
        if (typeof window !== "undefined" && navigator.clipboard) {
          navigator.clipboard
            .writeText(textToCopy)
            .catch(err => {
              if (showToast) {
                toast
                  ? toast({
                      title: "Error al copiar al portapapeles",
                      description: err,
                    })
                  : null
              }
              console.error("Failed to copy text to clipboard", err)
            })
            .then(() => {
              if (showToast) {
                toast({
                  title: "Se copió al portapapeles",
                  description: textToCopy,
                })
              }
            })
        } else {
          console.warn(
            "Clipboard API not supported or not running in client-side"
          )
        }
        onClick ? onClick() : null
      }}
    >
      Copiar {label}
    </DropdownMenuItem>
  )
}
