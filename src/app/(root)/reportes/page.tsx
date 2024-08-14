import { ScrollArea } from "@/components/ui/scroll-area"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reportes | AuditorIA",
  description: "Página para extraer reportes de las tareas",
}

export default function Page() {
  return <ScrollArea className='max-h-dvh h-dvh pt-16 min-h-dvh'></ScrollArea>
}
