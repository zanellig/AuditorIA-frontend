"use client"
import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { LogOut, Settings, Upload } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { removeAuthCookie } from "@/lib/auth"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import Logo from "../logo"
import { Button } from "../ui/button"
import { useUser } from "@/components/context/UserProvider"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserProfileFormSchema } from "@/lib/forms"
import { z } from "zod"
import { useToast } from "../ui/use-toast"
import { Input } from "../ui/input"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function AvatarButton({ className }: { className?: string }) {
  const {
    username,
    userEmail,
    userFullName,
    updateUserEmail,
    updateUserFullName,
    refreshAvatar,
    refreshUser,
  } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof updateUserProfileFormSchema>>({
    resolver: zodResolver(updateUserProfileFormSchema),
    defaultValues: {
      username,
      fullName: userFullName,
      email: userEmail,
    },
  })
  const onSubmit = async (
    data: z.infer<typeof updateUserProfileFormSchema>
  ) => {
    try {
      if (data.fullName !== userFullName) {
        await updateUserFullName(data.fullName)
      }
      if (data.email !== userEmail) {
        await updateUserEmail(data.email)
      }
      form.reset()
      toast({ title: "Perfil actualizado", variant: "success" })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({ title: "Error al actualizar el perfil", variant: "destructive" })
    }
  }
  const onLogout = async () => {
    await removeAuthCookie()
    Promise.allSettled([refreshUser(), refreshAvatar()])
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar userFullName={userFullName} className='cursor-pointer' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-fit", className)}>
        <article className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
          <UserAvatar userFullName={userFullName} />
          <section className='w-full flex-1 text-left text-sm leading-tight'>
            <DropdownMenuLabel className='select-none p-0 m-0'>
              {userFullName}
            </DropdownMenuLabel>
            <DropdownMenuLabel className='text-xs text-muted-foreground p-0 m-0'>
              {userEmail}
            </DropdownMenuLabel>
          </section>
        </article>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={e => {
            e.preventDefault()
            const event = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
            document
              .getElementById("user-settings-button")
              ?.dispatchEvent(event)
          }}
        >
          {/* 
            I don't know why this works this way, but I did it here and on the delete-button component. 
            I think that when we use the DropdownMenuItem as a trigger of the Dialog itself, the event gets propagated to the dropdown
            and closes it.
            This means that it also closes the dialog.
            I don't know if there's a better way to do this, but this is the only way I found to make it work.
          */}
          <div className='h-full w-full' onClick={e => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger asChild>
                <span
                  className='h-full w-full flex gap-2 items-center'
                  id='user-settings-button'
                >
                  <Settings size={GLOBAL_ICON_SIZE} />
                  Configuración
                </span>
              </DialogTrigger>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar perfil</DialogTitle>
                      <DialogDescription>
                        Realizá cambios en tu perfil acá. Tocá guardar cuando
                        hayas terminado.
                      </DialogDescription>
                    </DialogHeader>
                    <article className='flex gap-8'>
                      <section className='relative h-full'>
                        <div className='flex flex-col gap-2 items-center justify-center h-full'>
                          {/* <Logo width={128} height={128} /> */}
                          <Image
                            src={"/api/avatar"}
                            alt={userFullName}
                            width={128}
                            height={128}
                          />
                          <Button
                            variant={"outline"}
                            className='flex gap-2 items-center'
                          >
                            <Upload size={GLOBAL_ICON_SIZE} />
                            <span>Editar foto</span>
                          </Button>
                        </div>
                      </section>
                      <section className='grid grid-cols-2 gap-2 items-center'>
                        <FormField
                          control={form.control}
                          name='username'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor='username'>
                                Nombre de usuario
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  name='username'
                                  placeholder={username}
                                  disabled
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormMessage />

                        <FormField
                          control={form.control}
                          name='fullName'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor='fullName'>
                                Nombre completo
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  name='fullName'
                                  placeholder={userFullName}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormMessage />

                        <FormField
                          control={form.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem className='col-span-2'>
                              <FormLabel htmlFor='email'>
                                Correo electrónico
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  name='email'
                                  placeholder={userEmail}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormMessage />
                      </section>
                    </article>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button className='w-full' type='submit'>
                          Guardar
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Form>
            </Dialog>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='gap-2' onClick={onLogout}>
          <LogOut size={GLOBAL_ICON_SIZE} />
          <>Cerrar sesión</>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
interface UserAvatarProps
  extends React.ComponentPropsWithoutRef<typeof Avatar> {
  userFullName: string
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ userFullName, className, children, ...props }, ref) => {
    // Extract initials from the userFullName
    const initials = userFullName
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .substring(0, 2) // Limit to 2 initials, e.g., for "John Doe" => "JD"

    return (
      <Avatar ref={ref} className={cn(className)} {...props}>
        {/* Uncomment and use if you have an image source */}
        <AvatarImage src={"/api/avatar"} alt={userFullName} />
        <AvatarFallback className='select-none' delayMs={300}>
          {initials}
        </AvatarFallback>
        {children}
      </Avatar>
    )
  }
)

UserAvatar.displayName = "UserAvatar"
