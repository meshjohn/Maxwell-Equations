# EM Field Simulator — Maxwell's Equations

An interactive 3D electromagnetic field simulator built with **Next.js 14**, **Three.js**, and **React Three Fiber**. Visualizes all four Maxwell's equations in real time.

## Features

- 4 field modes: plane wave, standing wave, dipole radiation, circular polarization
- Toggle E field, B field, Poynting vector (S = E×B), and wavefronts independently
- Adjustable frequency ω, amplitude A, wave speed c
- Pause / resume / reset animation
- Live readouts: |E| peak, |B| peak, wavelength λ, average |S|
- Maxwell's equations panel — active equations highlight per mode
- Full orbit controls (drag to rotate, scroll to zoom)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
http://localhost:3000
```

## Project Structure

```
em-field/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Entry point — dynamic import (no SSR)
│   └── globals.css         # CSS variables, range slider, scrollbar
│
├── components/
│   ├── Scene.tsx           # Main canvas, camera, lights, layout
│   ├── PlaneWave.tsx       # E + B + S arrows along Z axis
│   ├── StandingWave.tsx    # Superposition of ±Z plane waves
│   ├── DipoleField.tsx     # Radiating 2D grid from point source
│   ├── CircularField.tsx   # Rotating ring — circular polarization
│   ├── Wavefronts.tsx      # Expanding torus rings
│   └── ControlPanel.tsx    # Full sidebar UI
│
├── hooks/
│   └── useFieldClock.ts    # rAF animation clock with pause/resume/reset
│
└── lib/
    └── fieldMath.ts        # All Maxwell's equations as typed functions
```

## Physics Reference

### Maxwell's Equations (SI units)

| Equation | Formula | What it means |
|---|---|---|
| Gauss (electric) | ∇·E = ρ/ε₀ | E field lines start/end on charges |
| Gauss (magnetic) | ∇·B = 0 | No magnetic monopoles |
| Faraday | ∇×E = −∂B/∂t | Changing B induces curling E |
| Ampère–Maxwell | ∇×B = μ₀(J + ε₀∂E/∂t) | Changing E (or current) induces curling B |

### Wave Functions Used

**Plane wave** (propagates along +Z):
```
E(z,t) = A · sin(ωt − kz) ŷ
B(z,t) = A · sin(ωt − kz) x̂
S = E × B / μ₀  (points along +Z)
```

**Standing wave** (superposition of ±Z waves):
```
E(z,t) = 2A · sin(kz) · cos(ωt) ŷ
B(z,t) = 2A · cos(kz) · sin(ωt) x̂
```
Note: E and B are 90° out of phase in both space and time.

**Dipole radiation** (point source at origin):
```
E(r,t) ∝ (1/r) · sin(ωt − kr) · θ̂   [far field]
B(r,t) ∝ (1/r) · sin(ωt − kr) · φ̂
```

**Circular polarization** (rotating E and B):
```
E(φ,t) = A · sin(ωt − 2φ) · t̂
B(φ,t) = A · cos(ωt − 2φ) · ŷ
```

### Derived Quantities

- **Poynting vector**: `S = (1/μ₀) E × B` — energy flux density [W/m²]
- **Energy density**: `u = ε₀|E|²/2 + |B|²/2μ₀` [J/m³]
- **Wave impedance**: `Z = |E|/|B| = c` in vacuum [Ω]
- **Wavelength**: `λ = 2π/k`

## Extending the Project

### Add a new field mode

1. Add the new mode type to `lib/fieldMath.ts`:
```ts
export type FieldMode = 'plane' | 'standing' | 'dipole' | 'circular' | 'yourMode'
```

2. Create `components/YourMode.tsx` following the pattern in `PlaneWave.tsx`:
- Build arrow helpers with `useMemo`
- Add/remove them in `useEffect`
- Update them in `useFrame`

3. Add it to the mode list in `components/ControlPanel.tsx`

4. Render it conditionally in `components/Scene.tsx`:
```tsx
{mode === 'yourMode' && <YourMode time={time} freq={freq} amp={amp} showE={showE} showB={showB} />}
```

### Add a particle tracer

To show charged particle motion in the field, create `components/ParticleTracer.tsx`:
```ts
// Lorentz force: F = q(E + v × B)
// Integrate with Euler or RK4 each frame
const a = E.clone().add(velocity.clone().cross(B)).multiplyScalar(q / m)
velocity.addScaledVector(a, dt)
position.addScaledVector(velocity, dt)
```

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| next | 14.2.3 | Framework, SSR disable via dynamic() |
| three | ^0.164 | 3D rendering, ArrowHelper, geometry |
| @react-three/fiber | ^8.16 | React wrapper for Three.js |
| @react-three/drei | ^9.105 | OrbitControls, Grid helpers |
| typescript | ^5 | Type safety throughout |
| tailwindcss | ^3.4 | Utility classes for layout |

## License

MIT
