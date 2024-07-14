import DataTable from "@/components/DataTable"
import { Tasks, Task } from "@/lib/tasks"
import { columns } from "@/lib/columns-tareas"

export default function TablaTareas({ tareas }: { tareas: any }) {
  return <DataTable columns={columns} data={tareas} />
}
