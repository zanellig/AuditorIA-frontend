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
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { LogOut, Settings, Upload } from "lucide-react"
import { GLOBAL_ICON_SIZE, IPAD_SIZE_QUERY } from "@/lib/consts"
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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/context/UserProvider"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserProfileFormSchema } from "@/lib/forms"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { StatefulButton } from "../stateful-button"

export function AvatarButton({ className }: { className?: string }) {
  const {
    username,
    userEmail,
    userFullName,
    userAvatar,
    updateUserEmail,
    updateUserFullName,
    refreshAvatar,
    refreshUser,
    removeUserData,
  } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof updateUserProfileFormSchema>>({
    resolver: zodResolver(updateUserProfileFormSchema),
    defaultValues: {
      username,
      fullName: userFullName,
      email: userEmail,
      image: "",
    },
  })
  const [file, setFile] = React.useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)
  const onSubmit = async (
    data: z.infer<typeof updateUserProfileFormSchema>
  ) => {
    try {
      console.log(data)
      if (data.fullName !== userFullName) {
        await updateUserFullName(data.fullName)
      }
      if (data.email !== userEmail) {
        await updateUserEmail(data.email)
      }
      await Promise.allSettled([refreshUser(), refreshAvatar()])
      form.reset()
      toast({ title: "Perfil actualizado", variant: "success" })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({ title: "Error al actualizar el perfil", variant: "destructive" })
    }
  }
  const onLogout = async () => {
    await Promise.allSettled([removeAuthCookie(), removeUserData()])
    router.push("/login")
  }

  const isDesktop = useMediaQuery(IPAD_SIZE_QUERY)

  return (
    <>
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
            className='gap-2'
            onSelect={() => setIsDialogOpen(true)}
          >
            <Settings size={GLOBAL_ICON_SIZE} />
            <>Configuración</>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='gap-2' onClick={onLogout}>
            <LogOut size={GLOBAL_ICON_SIZE} />
            <>Cerrar sesión</>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className='h-full w-full'>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogContent>
                <button type='submit'>?</button>
                <DialogHeader>
                  <DialogTitle>Editar perfil</DialogTitle>
                  <DialogDescription>
                    Realizá cambios en tu perfil acá.{" "}
                    {isDesktop && "Tocá guardar cuando hayas terminado."}
                  </DialogDescription>
                </DialogHeader>
                <article className='flex gap-8'>
                  <section className='relative h-full'>
                    <div className='flex flex-col gap-2 items-center justify-center h-full'>
                      <Image
                        alt={userFullName}
                        width={128}
                        height={128}
                        src={userAvatar}
                      />

                      <Button
                        variant={"outline"}
                        className='flex gap-2 items-center'
                        onClick={e => {
                          e.preventDefault()
                          document.getElementById("profile-pic-input")?.click()
                        }}
                      >
                        <Upload size={GLOBAL_ICON_SIZE} />
                        <span>Editar foto</span>
                      </Button>

                      <input
                        id='profile-pic-input'
                        className='hidden'
                        type='file'
                        onChange={e => {
                          if (!e.target.files) return
                          setFile(e.target.files[0])
                        }}
                      />
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>
                </article>
                <DialogFooter className='flex flex-col gap-2'>
                  {/* <DialogClose asChild> */}
                  <Button
                    className='w-full'
                    type='submit'
                    disabled={!form.formState.isDirty && file === null}
                    // isLoading={
                    //   form.formState.isSubmitting ||
                    //   form.formState.isLoading ||
                    //   form.formState.isValidating
                    // }
                  >
                    Guardar
                  </Button>
                  {/* </DialogClose> */}
                  {!isDesktop && (
                    <DialogDescription>
                      Tocá guardar cuando hayas terminado.
                    </DialogDescription>
                  )}
                </DialogFooter>
              </DialogContent>
            </form>
          </Form>
        </Dialog>
      </div>
    </>
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
      ? userFullName
          .split(" ")
          .map(name => name.charAt(0))
          .join("")
          .substring(0, 2) // Limit to 2 initials, e.g., for "John Doe" => "JD"
      : "NN"

    const { userAvatar } = useUser()

    return (
      <Avatar ref={ref} className={cn(className)} {...props}>
        <AvatarImage alt={userFullName} src={userAvatar} />
        <AvatarFallback className='select-none' delayMs={300}>
          {initials}
        </AvatarFallback>
        {children}
      </Avatar>
    )
  }
)

UserAvatar.displayName = "UserAvatar"
