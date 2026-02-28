import { create } from 'zustand'

const useY2KRacerStore = create((set) => ({
  gameState: 'menu', // 'menu' | 'carSelect' | 'mapSelect' | 'playing' | 'paused'
  selectedCar: 'skyline-r34',
  selectedMap: 'nyc',
  speed: 0,
  carX: 0,
  carZ: 0,
  carHeading: 0,

  startGame: () => set({ gameState: 'carSelect' }),
  selectCar: (carId) => set({ selectedCar: carId, gameState: 'mapSelect' }),
  selectMap: (mapId) => set({ selectedMap: mapId, gameState: 'playing' }),
  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),
  returnToMenu: () => set({ gameState: 'menu', speed: 0, carX: 0, carZ: 0, carHeading: 0 }),
  updateHud: (speed, carX, carZ, carHeading) => set({ speed, carX, carZ, carHeading }),
}))

export default useY2KRacerStore
