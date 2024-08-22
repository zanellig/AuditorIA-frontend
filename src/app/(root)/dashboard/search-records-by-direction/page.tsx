import SearchRecords from "@/components/search-records"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { LoopIcon } from "@radix-ui/react-icons"

export default function Page() {
  return (
    <SearchRecords
      title='dirección'
      icon={<LoopIcon className={DASHBOARD_ICON_CLASSES} />}
      shouldEnterText='la dirección del llamado'
      _route='DIRECCION'
    />
  )
}
