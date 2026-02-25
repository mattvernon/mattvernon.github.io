import { create } from 'zustand'

const useRacingStore = create((set) => ({
  gameState: 'menu', // 'menu' | 'playing' | 'paused'
  speed: 0,

  startGame: () => set({ gameState: 'playing' }),
  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),
  returnToMenu: () => set({ gameState: 'menu', speed: 0 }),
  updateSpeed: (speed) => set({ speed }),
}))

export default useRacingStore
