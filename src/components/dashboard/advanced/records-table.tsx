import TableContainer from "@/components/tables/table-core/table-container"
import { SpeakerLoudIcon } from "@radix-ui/react-icons"
import { TypographyH4 } from "@/components/typography/h4"
import { Separator } from "@/components/ui/separator"
import TableTitleContainer from "@/components/tables/table-core/table-title-container"
import DataTable from "@/components/tables/table-core/data-table"
import { columns as recordsColumns } from "@/components/tables/records-table/columns-records"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import {
  Recordings,
  SupportedLocales,
  TableSupportedDataTypes,
} from "@/lib/types.d"

type RecordsTableProps = {
  err: unknown
  res: Recordings
}

export default function RecordsTable({ err, res }: RecordsTableProps) {
  return (
    <>
      <TableTitleContainer>
        <SpeakerLoudIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
        <TypographyH4>Grabaciones</TypographyH4>
      </TableTitleContainer>
      <Separator className='my-4' />
      {err !== null && (
        <ErrorCodeUserFriendly
          error={err}
          locale={SupportedLocales.Values.es}
        />
      )}
      <DataTable
        columns={recordsColumns}
        data={res}
        type={TableSupportedDataTypes.Recordings}
      />
    </>
  )
}
