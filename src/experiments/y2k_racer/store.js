import { create } from 'zustand'

const useY2KRacerStore = create((set) => ({
  gameState: 'menu', // 'menu' | 'playing' | 'paused'
  speed: 0,
  carX: 0,
  carZ: 0,
  carHeading: 0,

  startGame: () => set({ gameState: 'playing' }),
  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),
  returnToMenu: () => set({ gameState: 'menu', speed: 0, carX: 0, carZ: 0, carHeading: 0 }),
  updateHud: (speed, carX, carZ, carHeading) => set({ speed, carX, carZ, carHeading }),
}))

export default useY2KRacerStore
