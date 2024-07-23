import { TasksAPI } from "@/lib/actions"
import { _tasksPath, _urlBase } from "@/lib/api/paths"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import TitleH1 from "@/components/typography/titleH1"
import ParagraphP from "@/components/typography/paragraphP"
import SubtitleH2 from "@/components/typography/subtitleH2"

export default async function TablaTasks() {
  const tasks = new TasksAPI(_urlBase, _tasksPath)
  let allTasks
  try {
    allTasks = await tasks.getTasks(true)
  } catch (error: any) {
    return (
      <div className='flex flex-col space-y-10'>
        <TitleH1>¡Ha ocurrido un error cargando la lista de tareas! 😯</TitleH1>
        <ParagraphP>
          Contacte a su administrador de IT y otorgue el siguiente código de
          error:
        </ParagraphP>
        {error.cause.code === "UND_ERR_CONNECT_TIMEOUT" ? (
          <SubtitleH2>Compruebe la conexión a la VPN</SubtitleH2>
        ) : null}
        {error.cause.code === "ECONNREFUSED" ? (
          <SubtitleH2>
            Se ha rechazado la conexión desde el servidor.
          </SubtitleH2>
        ) : null}
        <code>
          {"Message: " + error.message}
          <br />
          <br />
          {"Stack: " + error.stack}
        </code>
      </div>
    )
  }

  return <DataTable columns={columns} data={allTasks} type={"tasks"} />
}
