"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Settings, WebhookIcon } from "lucide-react"

export default function AdminPage() {
  return (
    <main className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Panel de Administración</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Webhooks</CardTitle>
            <CardDescription>
              Configura y administra los webhooks de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className='w-full'>
              <Link href='/admin/webhooks'>
                <WebhookIcon className='mr-2 h-4 w-4' />
                Gestionar Webhooks
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Configuraciones generales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant='outline' className='w-full'>
              <Link href='#'>
                <Settings className='mr-2 h-4 w-4' />
                Configuración del Sistema
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
