const RAMP_FRAC = 0.28 // 28% of bridge length on each end is ramp

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t))
  return t * t * (3 - 2 * t)
}

export default class ElevationSystem {
  constructor(mapConfig) {
    // Pre-compute bridge geometry data
    this.bridges = (mapConfig.bridgeDefs || []).map(def => {
      const dx = def.end.x - def.start.x
      const dz = def.end.z - def.start.z
      const length = Math.sqrt(dx * dx + dz * dz)
      return {
        ...def,
        dx, dz, length,
        dirX: dx / length,
        dirZ: dz / length,
        perpX: -dz / length,
        perpZ: dx / length,
      }
    })

    this.parkZones = (mapConfig.parkZones || []).map(p => p.bounds)
  }

  getElevation(x, z) {
    for (const bridge of this.bridges) {
      const elev = this._bridgeElevation(x, z, bridge)
      if (elev > 0) return elev
    }

    // Park gentle hills (simple sine-based noise)
    for (const p of this.parkZones) {
      if (x > p.minX + 10 && x < p.maxX - 10 && z > p.minZ + 10 && z < p.maxZ - 10) {
        const edgeDist = Math.min(
          x - p.minX, p.maxX - x,
          z - p.minZ, p.maxZ - z
        )
        const edgeFade = smoothstep(Math.min(1, edgeDist / 30))
        const h1 = Math.sin(x * 0.04) * Math.cos(z * 0.03) * 1.5
        const h2 = Math.sin(x * 0.08 + 1.7) * Math.cos(z * 0.06 + 0.9) * 0.8
        return Math.max(0, (h1 + h2) * edgeFade)
      }
    }

    return 0
  }

  getSlopeAngle(x, z, heading) {
    const delta = 0.5
    const fwdX = Math.sin(heading)
    const fwdZ = Math.cos(heading)
    const h0 = this.getElevation(x, z)
    const h1 = this.getElevation(x + fwdX * delta, z + fwdZ * delta)
    return Math.atan2(h1 - h0, delta)
  }

  _bridgeElevation(x, z, bridge) {
    const relX = x - bridge.start.x
    const relZ = z - bridge.start.z
    const t = (relX * bridge.dx + relZ * bridge.dz) / (bridge.length * bridge.length)

    if (t < -0.05 || t > 1.05) return 0

    const latDist = Math.abs(relX * bridge.perpX + relZ * bridge.perpZ)
    const halfWidth = bridge.width / 2 + 3
    if (latDist > halfWidth) return 0

    const tc = Math.max(0, Math.min(1, t))
    return this._elevationProfile(tc, bridge.height)
  }

  _elevationProfile(t, maxHeight) {
    if (t < RAMP_FRAC) {
      return maxHeight * smoothstep(t / RAMP_FRAC)
    } else if (t > 1 - RAMP_FRAC) {
      return maxHeight * smoothstep((1 - t) / RAMP_FRAC)
    }
    return maxHeight
  }
}
