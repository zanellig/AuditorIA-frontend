"use client"
import TranscriptionButton from "@/components/tables/records-table/transcription-button.server"
import { Recording } from "@/lib/types"
import { Row } from "@tanstack/react-table"
import { useSearchParams } from "next/navigation"

export default function Page() {
  const search = useSearchParams()
  const stringyfiedObject = search.get("search")
  const parsedObject: Row<Recording> = stringyfiedObject
    ? JSON.parse(stringyfiedObject)
    : null
  return <TranscriptionButton row={parsedObject} />
}
