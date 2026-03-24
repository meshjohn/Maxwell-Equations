'use client'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { dipoleE, dipoleB } from '@/lib/fieldMath'

interface Props {
  time:  number
  freq:  number
  amp:   number
  showE: boolean
  showB: boolean
}

const GRID = 6
const STEP = 1.5

export default function DipoleField({ time, freq, amp, showE, showB }: Props) {
  const groupRef = useRef<THREE.Group>(null!)

  const arrows = useMemo(() => {
    const pts: { x: number; z: number; r: number }[] = []
    for (let x = -GRID; x <= GRID; x += STEP) {
      for (let z = -GRID; z <= GRID; z += STEP) {
        const r = Math.sqrt(x * x + z * z)
        if (r < 0.8) continue
        pts.push({ x, z, r })
      }
    }
    return {
      eArr: pts.map(p => ({ a: new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(p.x,0,p.z), 1, 0x4a9eff, 0.26, 0.12), ...p })),
      bArr: pts.map(p => ({ a: new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(p.x,0,p.z), 1, 0xff8c3a, 0.26, 0.12), ...p })),
    }
  }, [])

  useEffect(() => {
    const g = groupRef.current
    arrows.eArr.forEach(({ a }) => g.add(a))
    arrows.bArr.forEach(({ a }) => g.add(a))
    return () => {
      arrows.eArr.forEach(({ a }) => g.remove(a))
      arrows.bArr.forEach(({ a }) => g.remove(a))
    }
  }, [arrows])

  useFrame(() => {
    arrows.eArr.forEach(({ a, x, z, r }) => {
      const E = dipoleE(x, z, time, freq, amp)
      const len = E.length()
      if (!showE || len < 0.04) { a.visible = false; return }
      a.visible = true
      a.setDirection(E.clone().normalize())
      a.setLength(Math.min(len, 2.2), 0.26, 0.12)
    })
    arrows.bArr.forEach(({ a, x, z }) => {
      const B = dipoleB(x, z, time, freq, amp)
      const len = Math.abs(B.y)
      if (!showB || len < 0.04) { a.visible = false; return }
      a.visible = true
      a.setDirection(new THREE.Vector3(0, B.y > 0 ? 1 : -1, 0))
      a.setLength(Math.min(len, 1.6), 0.26, 0.12)
    })
  })

  return <group ref={groupRef} />
}
