'use client'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { FieldMode } from '@/lib/fieldMath'

interface Props {
  time:  number
  speed: number
  mode:  FieldMode
}

const N_RINGS = 6

export default function Wavefronts({ time, speed, mode }: Props) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>(Array(N_RINGS).fill(null))

  const phases = useMemo(() => Array.from({ length: N_RINGS }, (_, i) => i / N_RINGS), [])

  useFrame(() => {
    phases.forEach((phase, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return

      const p = ((time * speed * 0.35 + phase) % 1 + 1) % 1
      const r = p * 11
      const opacity = (1 - p) * 0.65

      mesh.visible = opacity > 0.04
      ;(mesh.material as THREE.MeshStandardMaterial).opacity = opacity

      if (mode === 'plane') {
        // Flat ring traveling along X axis
        mesh.scale.set(1, 1, 1)
        mesh.rotation.set(0, 0, 0)
        mesh.position.set((p - 0.5) * 18, 0, 0)
      } else {
        // Expanding sphere-like rings from origin
        mesh.scale.set(r, r, 1)
        mesh.rotation.set(0, 0, 0)
        mesh.position.set(0, 0, 0)
      }
    })
  })

  return (
    <group>
      {phases.map((_, i) => (
        <mesh
          key={i}
          ref={el => { meshRefs.current[i] = el }}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.1, 0.05, 8, 48]} />
          <meshStandardMaterial
            color={0xff4a7a}
            transparent
            opacity={0.6}
            emissive={new THREE.Color(0x991130)}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}
