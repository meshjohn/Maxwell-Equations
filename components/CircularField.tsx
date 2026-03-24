'use client'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { circularE, circularB } from '@/lib/fieldMath'

interface Props {
  time:  number
  freq:  number
  amp:   number
  showE: boolean
  showB: boolean
}

const CR = 4
const NC = 14

export default function CircularField({ time, freq, amp, showE, showB }: Props) {
  const groupRef = useRef<THREE.Group>(null!)

  const arrows = useMemo(() => {
    return Array.from({ length: NC }, (_, i) => {
      const angle = (i / NC) * Math.PI * 2
      const x = Math.cos(angle) * CR
      const z = Math.sin(angle) * CR
      return {
        ea: new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(x,0,z), 1, 0x4a9eff, 0.28, 0.13),
        ba: new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(x,0,z), 1, 0xff8c3a, 0.28, 0.13),
        angle,
      }
    })
  }, [])

  useEffect(() => {
    const g = groupRef.current
    arrows.forEach(({ ea, ba }) => { g.add(ea); g.add(ba) })
    return () => { arrows.forEach(({ ea, ba }) => { g.remove(ea); g.remove(ba) }) }
  }, [arrows])

  useFrame(() => {
    arrows.forEach(({ ea, ba, angle }) => {
      const E = circularE(angle, time, freq, amp)
      const eLen = E.length()
      if (!showE || eLen < 0.04) { ea.visible = false }
      else {
        ea.visible = true
        ea.setDirection(E.clone().normalize())
        ea.setLength(Math.min(eLen, 2.4), 0.28, 0.13)
      }

      const B = circularB(angle, time, freq, amp)
      const bLen = Math.abs(B.y)
      if (!showB || bLen < 0.04) { ba.visible = false }
      else {
        ba.visible = true
        ba.setDirection(new THREE.Vector3(0, B.y > 0 ? 1 : -1, 0))
        ba.setLength(Math.min(bLen, 2.4), 0.28, 0.13)
      }
    })
  })

  return <group ref={groupRef} />
}
