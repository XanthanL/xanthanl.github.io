import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const StarField = ({ isWarping = false }) => {
  const points = useRef<THREE.Points>(null)
  const count = 5000

  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const initPos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100
      const y = (Math.random() - 0.5) * 100
      const z = (Math.random() - 0.5) * 100
      pos.set([x, y, z], i * 3)
      initPos.set([x, y, z], i * 3)
    }
    return [pos, initPos]
  }, [])

  useFrame((state) => {
    if (!points.current) return
    const time = state.clock.getElapsedTime()
    const geo = points.current.geometry
    const posAttr = geo.getAttribute('position')

    for (let i = 0; i < count; i++) {
      let z = posAttr.getZ(i)
      
      // Hyperdrive Effect: Stars rush towards the camera
      if (isWarping) {
        z += 2.5 // Warp speed
        if (z > 50) z = -50
      } else {
        z += 0.05 // Normal drift
        if (z > 50) z = -50
      }
      
      posAttr.setZ(i, z)
    }
    posAttr.needsUpdate = true

    // Rotation based on mouse
    points.current.rotation.y = THREE.MathUtils.lerp(points.current.rotation.y, state.mouse.x * 0.2, 0.05)
    points.current.rotation.x = THREE.MathUtils.lerp(points.current.rotation.x, -state.mouse.y * 0.2, 0.05)
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default StarField
