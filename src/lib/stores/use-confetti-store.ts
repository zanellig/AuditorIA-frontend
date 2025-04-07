import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ConfettiState {
  shownConfetti: string[] // array of UUIDs for transcriptions that have already shown confetti
  hasShownConfetti: (uuid: string) => boolean // check if confetti was shown for a specific UUID
  markConfettiShown: (uuid: string) => void // mark that confetti was shown for a specific UUID
}

export const useConfettiStore = create<ConfettiState>()(
  persist(
    (set, get) => ({
      shownConfetti: [],

      hasShownConfetti: (uuid: string) => {
        return get().shownConfetti.includes(uuid)
      },

      markConfettiShown: (uuid: string) => {
        if (!get().hasShownConfetti(uuid)) {
          set(state => ({
            shownConfetti: [...state.shownConfetti, uuid],
          }))
        }
      },
    }),
export const useConfettiStore = create<ConfettiState>()(
  persist(
    (set, get) => ({
      shownConfetti: [],

      hasShownConfetti: (uuid: string) => {
        return get().shownConfetti.includes(uuid)
      },

      markConfettiShown: (uuid: string) => {
        if (!get().hasShownConfetti(uuid)) {
          set(state => ({
            // Optionally limit array size by keeping only the most recent N items
            shownConfetti: [...state.shownConfetti, uuid].slice(-100),
          }))
        }
      },
    }),
    {
      name: "confetti-storage",
    }
  )
)
