import Report from "@/components/reports/report"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reportes | AuditorIA",
  description: "Página para extraer reportes de las tareas",
}

export default function Page() {
  return (
    <>
      <Report />
    </>
  )
}
