import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const StarField = ({ isWarping = false }) => {
  const points = useRef<THREE.Points>(null)
  const count = 8000 // More stars for deep space

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      // Pushing stars to a HUGE radius (between 400 and 800)
      const r = 400 + Math.random() * 400
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      
      const starType = Math.random()
      if (starType > 0.95) color.set('#ffccaa')
      else if (starType > 0.85) color.set('#aaccff')
      else color.set('#ffffff')
      
      cols.set([color.r, color.g, color.b], i * 3)
    }
    return [pos, cols]
  }, [])

  useFrame(() => {
    if (!points.current) return
    
    // Normal slow rotation for deep background feel
    points.current.rotation.y += 0.0005
    
    if (isWarping) {
      // Subtle stretch effect during warp
      points.current.scale.z = THREE.MathUtils.lerp(points.current.scale.z, 2.0, 0.1)
    } else {
      points.current.scale.z = THREE.MathUtils.lerp(points.current.scale.z, 1.0, 0.1)
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={1.5} // Larger size since they are very far away
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default StarField
