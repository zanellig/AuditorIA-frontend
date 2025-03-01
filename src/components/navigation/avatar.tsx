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
import { AspectRatio } from "@/components/ui/aspect-ratio"

export function AvatarButton({ className }: { className?: string }) {
  const {
    username,
    userEmail,
    userFullName,
    userInitials,
    userAvatar,
    updateUserEmail,
    updateUserFullName,
    refreshAvatar,
    refreshUser,
    removeUserData,
    updateUserAvatar,
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
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)
  const [isUploading, setIsUploading] = React.useState<boolean>(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const file = e.target.files[0]
    setFile(file)
    // Create preview URL for immediate feedback
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file, file.name)
      await updateUserAvatar(formData)
      await Promise.allSettled([refreshUser(), refreshAvatar()])
      toast({ title: "Foto de perfil actualizada", variant: "success" })
      setFile(null)
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        title: "Error al actualizar la foto de perfil",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

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
    toast({ title: "Sesión cerrada correctamente" })
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Realizá cambios en tu perfil acá.{" "}
              {isDesktop && "Tocá guardar cuando hayas terminado."}
            </DialogDescription>
          </DialogHeader>
          <div className='flex gap-8'>
            <section className='relative h-full'>
              <div className='flex flex-col gap-2 items-center justify-center h-full'>
                <div className='w-24 sm:w-32 md:w-40'>
                  <AspectRatio ratio={1} className='relative overflow-hidden'>
                    {previewUrl || userAvatar ? (
                      <Image
                        alt={userFullName}
                        src={previewUrl || userAvatar}
                        fill
                        className='rounded-full object-cover'
                        sizes='(max-width: 640px) 6rem, (max-width: 768px) 8rem, 10rem'
                        priority
                      />
                    ) : (
                      <div className='flex items-center justify-center w-full h-full rounded-full bg-muted text-lg sm:text-xl md:text-2xl'>
                        {userInitials}
                      </div>
                    )}
                  </AspectRatio>
                </div>

                <form
                  onSubmit={handleAvatarSubmit}
                  className='flex flex-col gap-2 items-center'
                >
                  <Button
                    variant={"outline"}
                    className='flex gap-2 items-center'
                    type='button'
                    onClick={() =>
                      document.getElementById("profile-pic-input")?.click()
                    }
                  >
                    <Upload size={GLOBAL_ICON_SIZE} />
                    <span>Editar foto</span>
                  </Button>

                  <input
                    id='profile-pic-input'
                    className='hidden'
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                  />

                  {file && (
                    <StatefulButton
                      type='submit'
                      isLoading={isUploading}
                      className='w-full'
                    >
                      {isUploading ? "Subiendo..." : "Guardar foto"}
                    </StatefulButton>
                  )}
                </form>
              </div>
            </section>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='flex-1'>
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
                <DialogFooter className='flex flex-col gap-2 mt-4'>
                  <Button
                    className='w-full'
                    type='submit'
                    disabled={!form.formState.isDirty}
                  >
                    Guardar
                  </Button>
                  {!isDesktop && (
                    <DialogDescription>
                      Tocá guardar cuando hayas terminado.
                    </DialogDescription>
                  )}
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
interface UserAvatarProps
  extends React.ComponentPropsWithoutRef<typeof Avatar> {
  userFullName: string
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ userFullName, className, children, ...props }, ref) => {
    const { userAvatar, userInitials } = useUser()

    return (
      <Avatar
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {userAvatar ? (
          <AvatarImage
            alt={userFullName}
            src={userAvatar}
            className='object-cover'
          />
        ) : null}
        <AvatarFallback className='select-none' delayMs={userAvatar ? 300 : 0}>
          {userInitials}
        </AvatarFallback>
        {children}
      </Avatar>
    )
  }
)

UserAvatar.displayName = "UserAvatar"
