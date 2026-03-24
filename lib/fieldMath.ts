import * as THREE from 'three'

export type FieldMode = 'plane' | 'dipole' | 'circular' | 'standing'

// ─── Plane wave ───────────────────────────────────────────────
// Propagates along +Z axis.
// E oscillates along Y, B oscillates along X.
// Satisfies: ∇×E = −∂B/∂t  and  ∇×B = μ₀ε₀ ∂E/∂t

export function planeWaveE(
  z: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  const phase = freq * t - z * 0.6
  return new THREE.Vector3(0, amp * Math.sin(phase), 0)
}

export function planeWaveB(
  z: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  const phase = freq * t - z * 0.6
  // B ⊥ E ⊥ propagation direction (right-hand rule)
  return new THREE.Vector3(amp * Math.sin(phase), 0, 0)
}

// Poynting vector S = (1/μ₀) E × B  (direction of energy flow)
export function planeWaveS(
  z: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  const E = planeWaveE(z, t, freq, amp)
  const B = planeWaveB(z, t, freq, amp)
  // S points along +Z for a wave propagating in +Z
  return new THREE.Vector3(0, 0, E.y * B.x * -1).multiplyScalar(amp)
}

// ─── Standing wave ────────────────────────────────────────────
// Superposition of +Z and −Z plane waves.
// Nodes (zero points) are fixed in space.
// E and B are 90° out of phase in time AND space.

export function standingWaveE(
  z: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  // E = 2A · sin(kz) · cos(ωt)
  const ey = 2 * amp * Math.sin(z * 0.6) * Math.cos(freq * t)
  return new THREE.Vector3(0, ey, 0)
}

export function standingWaveB(
  z: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  // B = 2A · cos(kz) · sin(ωt)  — 90° shifted from E
  const bx = 2 * amp * Math.cos(z * 0.6) * Math.sin(freq * t)
  return new THREE.Vector3(bx, 0, 0)
}

// ─── Dipole radiation ─────────────────────────────────────────
// Oscillating charge at origin.
// E radiates tangentially, falling off as 1/r in far field.
// Satisfies ∇·E = 0 in free space (no charge at field point).

export function dipoleE(
  x: number, z: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  const r = Math.sqrt(x * x + z * z) + 0.01
  const phase = freq * t - r * 0.5
  // Far-field: E ∝ sin(θ)/r · sin(phase), tangential direction
  const strength = amp * (1 / (r * r + 0.5)) * Math.sin(phase) * 6
  const tangent = new THREE.Vector3(-z / r, 0, x / r)
  return tangent.multiplyScalar(strength)
}

// Magnetic field curls around the propagation direction
export function dipoleB(
  x: number, z: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  const r = Math.sqrt(x * x + z * z) + 0.01
  const phase = freq * t - r * 0.5
  const strength = amp * (1 / (r + 0.5)) * Math.cos(phase) * 3
  // B is perpendicular to E and to radial direction → points in Y
  return new THREE.Vector3(0, strength, 0)
}

// ─── Circular polarization ────────────────────────────────────
// E and B vectors rotate as the wave propagates.
// The tip of E traces a helix in space.

export function circularE(
  angle: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  const phase = freq * t - angle * 2
  const tanX = -Math.sin(angle)
  const tanZ = Math.cos(angle)
  return new THREE.Vector3(tanX, 0, tanZ).multiplyScalar(amp * Math.sin(phase))
}

export function circularB(
  angle: number, t: number, freq: number, amp: number
): THREE.Vector3 {
  const phase = freq * t - angle * 2
  // B is π/2 ahead of E in phase (circular polarization)
  return new THREE.Vector3(0, 1, 0).multiplyScalar(amp * Math.cos(phase))
}

// ─── Derived quantities ───────────────────────────────────────

/** Energy density u = (ε₀/2)|E|² + (1/2μ₀)|B|² */
export function energyDensity(E: THREE.Vector3, B: THREE.Vector3): number {
  return 0.5 * E.lengthSq() + 0.5 * B.lengthSq()
}

/** Poynting vector magnitude |S| = |E×B| / μ₀ (normalized) */
export function poyntingMagnitude(E: THREE.Vector3, B: THREE.Vector3): number {
  return E.clone().cross(B).length()
}

/** Wave impedance Z = |E| / |B| (= c in vacuum = 3×10⁸ Ω) */
export function waveImpedance(E: THREE.Vector3, B: THREE.Vector3): number {
  const bLen = B.length()
  return bLen > 0.001 ? E.length() / bLen : 0
}
