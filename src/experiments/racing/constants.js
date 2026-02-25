// City grid
export const GRID_SIZE = 8
export const BLOCK_SIZE = 40
export const ROAD_WIDTH = 12
export const SIDEWALK_WIDTH = 2

// Physics
export const MAX_SPEED = 60
export const ACCELERATION = 30
export const BRAKING = 50
export const FRICTION = 0.99
export const TURN_SPEED = 2.5
export const TURN_SPEED_FACTOR = 0.7
export const DRIFT_FACTOR = 0.92
export const COLLISION_SPEED_FACTOR = 0.3
export const FIXED_TIMESTEP = 1 / 60

// Car dimensions
export const CAR_WIDTH = 2
export const CAR_LENGTH = 4.5
export const CAR_HEIGHT = 1.4

// Camera
export const CAMERA_FOLLOW_DISTANCE = 4.5
export const CAMERA_FOLLOW_HEIGHT = 2.2
export const CAMERA_LOOK_AHEAD = 3
export const CAMERA_SMOOTH_SPEED = 5
export const CAMERA_FOV = 75

// Colors
export const PALETTE = {
  road: '#1a1a2e',
  roadLine: '#e0e0e0',
  building: '#0f0f1a',
  sidewalk: '#2a2a3e',
  neonPink: '#ff006e',
  neonBlue: '#00f0ff',
  neonGreen: '#39ff14',
  neonOrange: '#ff6600',
  neonPurple: '#b300ff',
  sky: '#050510',
  fog: '#0d0015',
  ground: '#111122',
  carBody: '#cc0000',
  carAccent: '#222222',
  headlight: '#ffffcc',
  taillight: '#ff0000',
  underglow: '#6600ff',
  streetLamp: '#ffaa44',
}

// Neon sign colors for random selection
export const NEON_COLORS = [
  PALETTE.neonPink,
  PALETTE.neonBlue,
  PALETTE.neonGreen,
  PALETTE.neonOrange,
  PALETTE.neonPurple,
]

// Building generation
export const MIN_BUILDING_HEIGHT = 10
export const MAX_BUILDING_HEIGHT = 60
export const BUILDINGS_PER_BLOCK_MIN = 1
export const BUILDINGS_PER_BLOCK_MAX = 4
export const NEON_SIGN_CHANCE = 0.5
export const LIT_WINDOW_CHANCE = 0.3

// Street lamps
export const LAMP_HEIGHT = 6
export const LAMP_SPACING = 20
export const LAMP_LIGHT_INTENSITY = 0.8
export const LAMP_LIGHT_DISTANCE = 15

// Post-processing
export const BLOOM_STRENGTH = 1.5
export const BLOOM_RADIUS = 0.4
export const BLOOM_THRESHOLD = 0.6
export const PIXEL_SIZE = 3.0

// Fog
export const FOG_DENSITY = 0.012
