import { create } from "zustand"
import { persist } from "zustand/middleware"
import { TaskRecordsSearchParams } from "@/lib/types"

interface TasksRecordsState {
  page: number
  search: string | null
  selectedFilter: keyof TaskRecordsSearchParams | null
  filters: TaskRecordsSearchParams
  setPage: (page: number) => void
  setSearch: (search: string | null) => void
  setSelectedFilter: (filter: keyof TaskRecordsSearchParams | null) => void
  updateFilters: (filters: Partial<TaskRecordsSearchParams>) => void
  resetFilters: () => void
  toggleSort: (field: NonNullable<TaskRecordsSearchParams["sortBy"]>) => void
}

export const useTasksRecordsStore = create<TasksRecordsState>()(
  persist(
    set => ({
      page: 0,
      search: null,
      selectedFilter: null,
      filters: {
        uuid: null,
        file_name: null,
        status: null,
        user: null,
        campaign: null,
        page: 0,
        globalSearch: null,
        sortBy: null,
        sortOrder: null,
      },
      setPage: page => {
        set({ page })
        set(state => ({
          filters: { ...state.filters, page },
        }))
      },
      setSearch: search => set({ search }),
      setSelectedFilter: selectedFilter => set({ selectedFilter }),
      updateFilters: newFilters =>
        set(state => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () =>
        set({
          page: 0,
          search: null,
          selectedFilter: "globalSearch",
          filters: {
            uuid: null,
            file_name: null,
            status: null,
            user: null,
            campaign: null,
            page: 0,
            globalSearch: null,
            sortBy: null,
            sortOrder: null,
          },
        }),
      toggleSort: field =>
        set(state => ({
          filters: {
            ...state.filters,
            sortBy: field,
            sortOrder:
              state.filters.sortBy === field
                ? state.filters.sortOrder === "asc"
                  ? "desc"
                  : "asc"
                : "asc",
          },
        })),
    }),
    {
      name: "tasks-records-storage",
    }
  )
)
