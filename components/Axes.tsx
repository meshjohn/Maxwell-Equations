'use client'
import { useRef } from 'react'
import * as THREE from 'three'

interface AxesProps {
  range?: number
}

export default function Axes({ range = 9 }: AxesProps) {
  const makePoints = (p1: [number,number,number], p2: [number,number,number]) =>
    [new THREE.Vector3(...p1), new THREE.Vector3(...p2)]

  return (
    <group>
      {/* X axis — red tint */}
      <line_>
        <bufferGeometry onUpdate={self => self.setFromPoints(makePoints([-range,0,0],[range,0,0]))} />
        <lineBasicMaterial color={0x1a2244} transparent opacity={0.4} />
      </line_>
      {/* Y axis — green tint */}
      <line_>
        <bufferGeometry onUpdate={self => self.setFromPoints(makePoints([0,-5,0],[0,5,0]))} />
        <lineBasicMaterial color={0x1a2244} transparent opacity={0.4} />
      </line_>
      {/* Z axis — blue tint (propagation direction) */}
      <line_>
        <bufferGeometry onUpdate={self => self.setFromPoints(makePoints([0,0,-range],[0,0,range]))} />
        <lineBasicMaterial color={0x334488} transparent opacity={0.5} />
      </line_>
    </group>
  )
}
