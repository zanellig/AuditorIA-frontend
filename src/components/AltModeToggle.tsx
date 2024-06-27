import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/theme-provider"
import { useEffect, useState } from "react"

export default function AltModeToggle() {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setIsDarkMode(theme === "dark")
  }, [theme])

  const handleToggle = () => {
    setTheme(isDarkMode ? "light" : "dark")
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="ModoVisualizacion"
        checked={isDarkMode}
        onClick={handleToggle}
      />
      <Label htmlFor="ModoVisualizacion">Modo de visualización</Label>
    </div>
  )
}
