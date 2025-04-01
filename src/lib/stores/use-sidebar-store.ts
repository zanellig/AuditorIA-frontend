import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
  openItems: Record<string, boolean>
  isOpen: (id: string) => boolean
  toggleOpen: (id: string) => void
  setOpen: (id: string, isOpen: boolean) => void
}

// These IDs match the pattern in the SidebarButton component
const DEFAULT_OPEN_ITEMS = {
  "sidebar-buscar-audios-sidebar-button-4": true,
  "sidebar-configuración-sidebar-button-7": true,
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      openItems: DEFAULT_OPEN_ITEMS,

      isOpen: (id: string) => {
        return !!get().openItems[id]
      },

      toggleOpen: (id: string) => {
        set(state => ({
          openItems: {
            ...state.openItems,
            [id]: !state.openItems[id],
          },
        }))
      },

      setOpen: (id: string, isOpen: boolean) => {
        set(state => ({
          openItems: {
            ...state.openItems,
            [id]: isOpen,
          },
        }))
      },
    }),
    {
      name: "sidebar-storage",
    }
  )
)
