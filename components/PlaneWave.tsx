'use client'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { planeWaveE, planeWaveB } from '@/lib/fieldMath'

interface PlaneWaveProps {
  time:   number
  freq:   number
  amp:    number
  showE:  boolean
  showB:  boolean
  showS:  boolean
  showA:  boolean
}

const Z_RANGE = 14
const Z_STEP  = 1.4
const CURVE_POINTS = 100

export default function PlaneWave({ time, freq, amp, showE, showB, showS, showA }: PlaneWaveProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const curveRef = useRef<THREE.Line | null>(null)

  const curveZPositions = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i <= CURVE_POINTS; i++) {
      arr.push(-Z_RANGE / 2 + (Z_RANGE * i) / CURVE_POINTS)
    }
    return arr
  }, [])

  const curveInitialPositions = useMemo(() => new Float32Array((CURVE_POINTS + 1) * 3), [])

  // Build arrow helpers once
  const arrows = useMemo(() => {
    const zPositions: number[] = []
    for (let z = -Z_RANGE / 2; z <= Z_RANGE / 2; z += Z_STEP) zPositions.push(z)

    const eArrows = zPositions.map(z => {
      const a = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,z), 1, 0x4a9eff, 0.28, 0.13)
      return { arrow: a, z }
    })
    const bArrows = zPositions.map(z => {
      const a = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,z), 1, 0xff8c3a, 0.28, 0.13)
      return { arrow: a, z }
    })
    const sArrows = zPositions.map(z => {
      const a = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,z), 0.5, 0x3affb0, 0.3, 0.16)
      return { arrow: a, z }
    })
    return { eArrows, bArrows, sArrows }
  }, [])

  // Add arrows and curve line imperatively — avoids <line> JSX (conflicts with SVGLineElement in TS)
  useEffect(() => {
    const g = groupRef.current
    arrows.eArrows.forEach(({ arrow }) => g.add(arrow))
    arrows.bArrows.forEach(({ arrow }) => g.add(arrow))
    arrows.sArrows.forEach(({ arrow }) => g.add(arrow))

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(curveInitialPositions, 3))
    const mat = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
    const curveLine = new THREE.Line(geo, mat)
    curveRef.current = curveLine
    g.add(curveLine)

    return () => {
      arrows.eArrows.forEach(({ arrow }) => g.remove(arrow))
      arrows.bArrows.forEach(({ arrow }) => g.remove(arrow))
      arrows.sArrows.forEach(({ arrow }) => g.remove(arrow))
      g.remove(curveLine)
      geo.dispose()
      mat.dispose()
    }
  }, [arrows, curveInitialPositions])

  useFrame(() => {
    arrows.eArrows.forEach(({ arrow, z }) => {
      const E = planeWaveE(z, time, freq, amp)
      const len = Math.abs(E.y)
      if (!showE || len < 0.04) { arrow.visible = false; return }
      arrow.visible = true
      arrow.setDirection(new THREE.Vector3(0, E.y > 0 ? 1 : -1, 0))
      arrow.setLength(Math.min(len, 2.5), 0.28, 0.13)
    })

    arrows.bArrows.forEach(({ arrow, z }) => {
      const B = planeWaveB(z, time, freq, amp)
      const len = Math.abs(B.x)
      if (!showB || len < 0.04) { arrow.visible = false; return }
      arrow.visible = true
      arrow.setDirection(new THREE.Vector3(B.x > 0 ? 1 : -1, 0, 0))
      arrow.setLength(Math.min(len, 2.5), 0.28, 0.13)
    })

    arrows.sArrows.forEach(({ arrow, z }) => {
      const E = planeWaveE(z, time, freq, amp)
      const B = planeWaveB(z, time, freq, amp)
      // S = E × B — for plane wave along +Z, magnitude = |Ey * Bx|
      const sLen = Math.abs(E.y * B.x) * 0.9
      if (!showS || sLen < 0.04) { arrow.visible = false; return }
      arrow.visible = true
      arrow.setDirection(new THREE.Vector3(0, 0, 1))
      arrow.setLength(Math.min(sLen, 1.8), 0.3, 0.16)
    })

    const curve = curveRef.current
    if (curve) {
      curve.visible = showA
      if (showA) {
        const positions = curve.geometry.attributes.position.array as Float32Array
        curveZPositions.forEach((z, i) => {
          const A = planeWaveE(z, time - Math.PI / (2 * freq), freq, amp)
          positions[i * 3] = A.x
          positions[i * 3 + 1] = A.y
          positions[i * 3 + 2] = z
        })
        curve.geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return <group ref={groupRef} />
}
