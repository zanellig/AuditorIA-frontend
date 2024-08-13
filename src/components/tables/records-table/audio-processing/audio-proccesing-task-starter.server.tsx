import { createTask } from "@/lib/actions"
import AudioProcessingTaskStarter from "@/components/tables/records-table/audio-processing/audio-processing-task-starter"
import { _urlBase } from "@/lib/api/paths"

export default function AudioProcessingTaskStarterServer({
  row,
}: {
  row: any
}) {
  async function POSTTask(
    url: string,
    fileName: string,
    params: Record<string, string>
  ) {
    return await createTask(
      [_urlBase, "/speech-to-text"],
      url,
      params,
      null,
      false,
      fileName
    )
  }
  return <AudioProcessingTaskStarter row={row} POSTTask={POSTTask} />
}
