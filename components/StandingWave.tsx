'use client'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { standingWaveE, standingWaveB } from '@/lib/fieldMath'

interface Props {
  time:  number
  freq:  number
  amp:   number
  showE: boolean
  showB: boolean
}

const Z_RANGE = 14
const Z_STEP  = 1.4

export default function StandingWave({ time, freq, amp, showE, showB }: Props) {
  const groupRef = useRef<THREE.Group>(null!)

  const arrows = useMemo(() => {
    const zPos: number[] = []
    for (let z = -Z_RANGE / 2; z <= Z_RANGE / 2; z += Z_STEP) zPos.push(z)
    return {
      eArr: zPos.map(z => ({ a: new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,z), 1, 0x4a9eff, 0.28, 0.13), z })),
      bArr: zPos.map(z => ({ a: new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,z), 1, 0xff8c3a, 0.28, 0.13), z })),
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
    arrows.eArr.forEach(({ a, z }) => {
      const E = standingWaveE(z, time, freq, amp)
      const len = Math.abs(E.y)
      if (!showE || len < 0.04) { a.visible = false; return }
      a.visible = true
      a.setDirection(new THREE.Vector3(0, E.y > 0 ? 1 : -1, 0))
      a.setLength(Math.min(len, 2.8), 0.28, 0.13)
    })
    arrows.bArr.forEach(({ a, z }) => {
      const B = standingWaveB(z, time, freq, amp)
      const len = Math.abs(B.x)
      if (!showB || len < 0.04) { a.visible = false; return }
      a.visible = true
      a.setDirection(new THREE.Vector3(B.x > 0 ? 1 : -1, 0, 0))
      a.setLength(Math.min(len, 2.8), 0.28, 0.13)
    })
  })

  return <group ref={groupRef} />
}
