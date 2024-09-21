import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AvatarButton({
  className,
  showButtons = false,
}: {
  className?: string
  showButtons: boolean
}) {
  return (
    <Avatar
      className={`transition-all duration-500 ${
        showButtons ? "translate-x-0" : "translate-x-12"
      }`}
    >
      {/* aca le pueden poner su avatar de github (o cualquier imagen que quieran), si lo cambian asegúrense de no meter este archivo / linea en el commit */}
      {/* <AvatarImage src='https://github.com/agustinbouzonn.png' />{" "} */}
      <AvatarFallback>GZ</AvatarFallback>
    </Avatar>
  )
}
