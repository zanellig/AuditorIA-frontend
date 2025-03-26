"use client"

import { useState, useEffect } from "react"
import { useWebhooksStore } from "@/lib/stores/use-webhooks-store"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, RefreshCw, Loader2 } from "lucide-react"
import { CustomBorderCard } from "@/components/custom-border-card"
import { toast } from "@/components/ui/use-toast"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

// Form schema for adding/editing webhooks
const formSchema = z.object({
  name: z.string().min(1, {
    message: "El nombre es obligatorio",
  }),
  base_url: z.string().url({
    message:
      "La URL base debe ser una URL válida (ej. https://api.ejemplo.com)",
  }),
  path: z.string().min(1, {
    message: "La ruta es obligatoria",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function WebhooksAdminPage() {
  const {
    webhooks,
    isLoading: storeLoading,
    error: storeError,
    setWebhooks,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    syncWithAPI,
    setLoading,
  } = useWebhooksStore()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditId, setCurrentEditId] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const queryClient = useQueryClient()

  // Query to fetch webhooks data
  const {
    data: webhooksData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const response = await fetch("/api/webhooks")
      if (!response.ok) {
        throw new Error("Error fetching webhooks")
      }
      return await response.json()
    },
  })

  // Update store when data is fetched
  useEffect(() => {
    if (webhooksData) {
      setWebhooks(webhooksData)
    }
  }, [webhooksData, setWebhooks])

  // Sync with API manually
  const handleSync = async () => {
    try {
      setIsSyncing(true)
      await syncWithAPI()
      toast({
        title: "Sincronización exitosa",
        description: "Los webhooks se han sincronizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error de sincronización",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Mutation for creating a webhook
  const createWebhookMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Check for 409 Conflict status (duplicate name)
        if (response.status === 409) {
          throw new Error(errorData.error || "Nombre de webhook duplicado")
        }
        throw new Error(errorData.error || "Error creating webhook")
      }

      return await response.json()
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] })
      addWebhook(
        {
          name: data.name,
          base_url: data.base_url,
          path: data.path,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        data.id
      )

      toast({
        title: "Webhook agregado",
        description: "El nuevo webhook ha sido agregado con éxito",
      })
    },
    onError: error => {
      console.error(error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al crear el webhook",
        variant: "destructive",
      })
    },
  })

  // Mutation for updating a webhook
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: FormValues }) => {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Check for 409 Conflict status (duplicate name)
        if (response.status === 409) {
          throw new Error(errorData.error || "Nombre de webhook duplicado")
        }
        throw new Error(errorData.error || "Error updating webhook")
      }

      return await response.json()
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] })
      updateWebhook(data.id, {
        name: data.name,
        base_url: data.base_url,
        path: data.path,
        updated_at: data.updated_at,
      })

      toast({
        title: "Webhook actualizado",
        description: "El webhook ha sido actualizado con éxito",
      })
    },
    onError: error => {
      console.error(error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al actualizar el webhook",
        variant: "destructive",
      })
    },
  })

  // Mutation for deleting a webhook
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error deleting webhook")
      }

      return await response.json()
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] })
      deleteWebhook(id)

      toast({
        title: "Webhook eliminado",
        description: "El webhook ha sido eliminado con éxito",
      })
    },
    onError: error => {
      console.error(error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al eliminar el webhook",
        variant: "destructive",
      })
    },
  })

  // Form for adding/editing webhooks
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      base_url: "",
      path: "",
    },
  })

  const openEditDialog = (id: number) => {
    const webhook = webhooks.find(w => w.id === id)
    if (webhook) {
      form.reset({
        name: webhook.name,
        base_url: webhook.base_url,
        path: webhook.path,
      })
      setCurrentEditId(id)
      setIsEditDialogOpen(true)
    }
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      if (currentEditId) {
        // Edit existing webhook
        updateWebhookMutation.mutate({ id: currentEditId, values })
      } else {
        // Add new webhook
        createWebhookMutation.mutate(values)
      }
      form.reset()
      setIsEditDialogOpen(false)
      setCurrentEditId(null)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el webhook",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id: number) => {
    deleteWebhookMutation.mutate(id)
  }

  // Loading and error states
  const isPageLoading = isLoading || storeLoading
  const pageError = error || storeError

  return (
    <main className='flex flex-col gap-4'>
      <CustomBorderCard
        title='Gestión de Webhooks'
        description='Configura y administra los webhooks de la aplicación'
        variant='default'
      />

      {pageError && (
        <div className='bg-destructive/15 text-destructive p-4 rounded-md mb-4'>
          <p className='font-medium'>Error:</p>
          <p>
            {pageError instanceof Error ? pageError.message : String(pageError)}
          </p>
        </div>
      )}

      <Tabs defaultValue='list' className='w-full'>
        <div className='flex items-center justify-between'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='list'>Lista de Webhooks</TabsTrigger>
            <TabsTrigger value='add'>Agregar Webhook</TabsTrigger>
          </TabsList>
          <Button
            variant='outline'
            onClick={handleSync}
            disabled={isSyncing}
            className='flex items-center gap-2'
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            Sincronizar
          </Button>
        </div>
        <TabsContent value='list' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Webhooks Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {isPageLoading ? (
                <div className='flex justify-center py-8'>
                  <Loader2
                    className='animate-spin text-muted-foreground'
                    size={GLOBAL_ICON_SIZE}
                  />
                </div>
              ) : webhooks.length === 0 ? (
                <p className='text-center py-4 text-muted-foreground'>
                  No hay webhooks configurados. Agrega uno nuevo.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>URL Base</TableHead>
                      <TableHead>Ruta</TableHead>
                      <TableHead>URL Completa</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map(webhook => (
                      <TableRow key={webhook.id}>
                        <TableCell className='font-medium'>
                          {webhook.name}
                        </TableCell>
                        <TableCell>{webhook.base_url}</TableCell>
                        <TableCell>{webhook.path}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {`${webhook.base_url}${webhook.path.startsWith("/") ? webhook.path : "/" + webhook.path}`}
                          </Badge>
                        </TableCell>
                        <TableCell className='flex space-x-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => openEditDialog(webhook.id)}
                          >
                            <Pencil className='h-4 w-4 mr-1' />
                            Editar
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size='sm' variant='destructive'>
                                <Trash2 className='h-4 w-4 mr-1' />
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto
                                  eliminará permanentemente el webhook &quot;
                                  {webhook.name}
                                  &quot; de tu cuenta.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(webhook.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='add'>
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ej. API de Notificaciones'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Un nombre descriptivo para identificar este webhook.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='base_url'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Base</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://api.ejemplo.com'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          La URL base del servicio (incluir protocolo https://).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='path'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ruta</FormLabel>
                        <FormControl>
                          <Input placeholder='/webhook/callback' {...field} />
                        </FormControl>
                        <FormDescription>
                          La ruta específica para las llamadas al webhook.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type='submit' className='w-full'>
                    <Plus className='h-4 w-4 mr-1' />
                    Agregar Webhook
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for editing webhooks */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Webhook</DialogTitle>
            <DialogDescription>
              Actualiza la información del webhook. Haz clic en guardar cuando
              hayas terminado.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='base_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Base</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='path'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruta</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type='submit'>Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
