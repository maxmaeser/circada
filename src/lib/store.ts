import { create } from 'zustand'

interface AppState {
  currentTime: Date
  setCurrentTime: (time: Date) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentTime: new Date(),
  setCurrentTime: (time) => set({ currentTime: time }),
})) 