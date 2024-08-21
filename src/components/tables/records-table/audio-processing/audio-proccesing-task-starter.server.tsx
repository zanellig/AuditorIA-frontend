// import { createTask } from "@/lib/actions"
// import AudioProcessingTaskStarter from "@/components/tables/records-table/audio-processing/audio-processing-task-starter"
// import { API_MAIN } from "@/lib/consts"

// export default function AudioProcessingTaskStarterServer({
//   row,
// }: {
//   row: any
// }) {
//   async function POSTTask(
//     nasUrl: string,
//     fileName: string,
//     params: Record<string, string>
//   ) {
//     return await createTask(
//       [API_MAIN, "speech-to-text"],
//       nasUrl,
//       params,
//       null,
//       false,
//       fileName
//     )
//   }
//   return <AudioProcessingTaskStarter row={row} POSTTask={POSTTask} />
// }
