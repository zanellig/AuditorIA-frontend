import { createContext, useState, useContext, ReactNode } from "react"

// Definir el tipo para el contexto
interface DialogContextType {
  openDialog: boolean
  handleDialogOpen: () => void
  handleDialogClose: () => void
}

// Crear el contexto con un valor por defecto
const DialogContext = createContext<DialogContextType | undefined>(undefined)

// Proveedor del contexto
export function DialogProvider({ children }: { children: ReactNode }) {
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const handleDialogOpen = () => {
    setOpenDialog(true)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  return (
    <DialogContext.Provider
      value={{ openDialog, handleDialogOpen, handleDialogClose }}
    >
      {children}
    </DialogContext.Provider>
  )
}

// Hook para usar el contexto
export function useDialog() {
  const context = useContext(DialogContext)
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider")
  }
  return context
}
