import SearchRecords from "@/components/search-records"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { Repeat } from 'lucide-react'

export default function Page() {
  return (
    <SearchRecords
      title='dirección'
      icon={<Repeat className={DASHBOARD_ICON_CLASSES}/>}
      shouldEnterText='la dirección del llamado'
      _route='DIRECCION'
      inputOptions={{
        inputType: "select",
        selectOptions: ["ENTRANTE", "SALIENTE"],
      }}
    />
  )
}
