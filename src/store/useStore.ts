import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Theme (stored locally)
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'payment-calendar-storage',
    }
  )
)
