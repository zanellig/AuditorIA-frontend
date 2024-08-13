import { createTask } from "@/lib/actions"
import EnvioDeTareas from "./envio-de-tareas"
import { _urlBase } from "@/lib/api/paths"

export default function EnvioDeTareasServer({
  className,
}: {
  className?: string
}) {
  async function POSTTaskWithFile(file: any, params: Record<string, string>) {
    "use server"
    return await createTask(
      [_urlBase, "speech-to-text"],
      null,
      params,
      file,
      false
    )
  }
  return (
    <EnvioDeTareas className={className} POSTTaskWithFile={POSTTaskWithFile} />
  )
}
