import React, { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useDashboard } from "@/components/context/DashboardProvider"
import { Label } from "../ui/label"

export default function DashboardSwitch() {
  // Local state to control the Switch
  const [localIsAdvanced, setLocalIsAdvanced] = useState(false)

  // Access context values
  const { isAdvanced, toggleDashboard } = useDashboard()

  // Sync local state with context on mount and context change
  useEffect(() => {
    setLocalIsAdvanced(isAdvanced)
  }, [isAdvanced])

  // Handle Switch change
  const handleCheckedChange = (checked: boolean) => {
    setLocalIsAdvanced(checked)
    toggleDashboard() // Toggle the dashboard context
  }

  return (
    <>
      <Label htmlFor='advanced-mode-switch'>Modo avanzado</Label>
      <Switch
        checked={localIsAdvanced}
        onCheckedChange={handleCheckedChange}
        id='advanced-mode-switch'
      />
    </>
  )
}
