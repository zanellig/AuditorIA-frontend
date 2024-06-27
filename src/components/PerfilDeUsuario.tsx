import { useDialog } from "@/contexts/dialog-context"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useAuth } from "@/contexts/AuthContext"

export default function PerfilDeUsuario() {
  const { logout } = useAuth()

  const { openDialog, handleDialogOpen, handleDialogClose } = useDialog()

  const handleMenuItemClick = (event: React.MouseEvent) => {
    event.preventDefault()
    handleDialogOpen()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src="https://avatars.githubusercontent.com/u/104658951?v=4" />
          <AvatarFallback>GZ</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 flex flex-col gap-2 p-2 mt-2">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleMenuItemClick}
          className={dropdownMenuStyle()}
        >
          Editar tu perfil
        </DropdownMenuItem>

        <DropdownMenuItem className={dropdownMenuStyle()}>
          Placeholder
        </DropdownMenuItem>
        <DropdownMenuItem className={dropdownMenuStyle()}>
          Placeholder
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={dropdownMenuStyle("text-red-500")}
          onClick={logout}
        >
          Cerrar sesión
        </DropdownMenuItem>

        <Dialog open={openDialog} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editá tu perfil</DialogTitle>
              <DialogDescription>
                Realizá cambios a tu perfil público acá. Tocá
                {
                  <span className="text-sm hover:text-accent-foreground">
                    {" "}
                    guardar
                  </span>
                }{" "}
                cuando hayas terminado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="common-name"
                  value="Gonzalo Zanelli"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleDialogClose}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function dropdownMenuStyle(className?: string) {
  return cn(
    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    className
  )
}
