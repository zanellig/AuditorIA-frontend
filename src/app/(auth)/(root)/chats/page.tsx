"use client"
import { columns } from "@/components/tables/chats-table/columns-chats"
import DataTable from "@/components/tables/table-core/data-table"
import { TableSupportedDataTypes } from "@/lib/types.d"
// import { Metadata } from "next"

// export const metadata: Metadata = {
//   title: "Chats | AuditorIA",
//   description: "Página para auditar chats",
// }

export default function Page() {
  return (
    <DataTable
      columns={columns}
      type={TableSupportedDataTypes.Recordings}
      data={[
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 10 },
        { id: 11 },
      ]}
      className='w-full'
    />
  )
}
