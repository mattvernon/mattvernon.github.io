export const SLIDE_DURATION = 1200
export const TRANSITION_DURATION = 800
export const CROSSFADE_DURATION = 3000
export const PRELOAD_AHEAD = 5

export const PW_HASH = 'd2760672c3010d591b868dfcc99e8690a6448c6ee992ae07df0325eb20b9d685'

// Ken Burns presets — pairs of [startTransform, endTransform]
export const KEN_BURNS_PRESETS = [
  { from: 'scale(1.0) translate(0%, 0%)', to: 'scale(1.15) translate(-2%, -1%)' },
  { from: 'scale(1.15) translate(-2%, -2%)', to: 'scale(1.0) translate(0%, 0%)' },
  { from: 'scale(1.0) translate(2%, 0%)', to: 'scale(1.12) translate(-1%, -2%)' },
  { from: 'scale(1.1) translate(0%, -2%)', to: 'scale(1.0) translate(1%, 1%)' },
  { from: 'scale(1.05) translate(-1%, 1%)', to: 'scale(1.18) translate(1%, -1%)' },
  { from: 'scale(1.2) translate(1%, 1%)', to: 'scale(1.05) translate(-1%, 0%)' },
]
