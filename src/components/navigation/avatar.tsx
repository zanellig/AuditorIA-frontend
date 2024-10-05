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
      {/* <AvatarImage src={}/>{" "} */}
      <AvatarFallback>GZ</AvatarFallback>
    </Avatar>
  )
}
