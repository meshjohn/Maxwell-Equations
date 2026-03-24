'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

interface AxesProps {
  range?: number
}

function AxisLine({
  p1,
  p2,
  color,
  opacity = 0.4,
}: {
  p1: [number, number, number]
  p2: [number, number, number]
  color: number
  opacity?: number
}) {
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...p1),
      new THREE.Vector3(...p2),
    ])
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    return new THREE.Line(geo, mat)
  }, [p1, p2, color, opacity]) // eslint-disable-line react-hooks/exhaustive-deps

  return <primitive object={line} />
}

export default function Axes({ range = 9 }: AxesProps) {
  return (
    <group>
      <AxisLine p1={[-range, 0, 0]} p2={[range, 0, 0]} color={0x1a2244} />
      <AxisLine p1={[0, -5, 0]} p2={[0, 5, 0]} color={0x1a2244} />
      <AxisLine p1={[0, 0, -range]} p2={[0, 0, range]} color={0x334488} opacity={0.5} />
    </group>
  )
}
