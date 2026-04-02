import { useRef, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, TorusKnot, Octahedron, Ring, Float } from '@react-three/drei'
import * as THREE from 'three'

interface XanthanSystemProps {
  activeSector: 'GODOT' | 'AI' | 'ROBOT' | 'CORE'
}

const XanthanSystem = forwardRef(({ activeSector }: XanthanSystemProps, ref) => {
  const sunRef = useRef<THREE.Group>(null!)
  const godotRef = useRef<THREE.Group>(null!)
  const aiRef = useRef<THREE.Group>(null!)
  const robotRef = useRef<THREE.Group>(null!)

  useImperativeHandle(ref, () => ({
    getPlanetPosition: (name: string) => {
      const target = name === 'CORE' ? sunRef.current : 
                     name === 'GODOT' ? godotRef.current :
                     name === 'AI' ? aiRef.current :
                     name === 'ROBOT' ? robotRef.current : null
      if (target) {
        const worldPos = new THREE.Vector3()
        target.getWorldPosition(worldPos)
        return worldPos
      }
      return new THREE.Vector3(0, 0, 0)
    }
  }))

  return (
    <group>
      <group ref={sunRef}>
        <Sun active={activeSector === 'CORE'} />
      </group>

      <Planet 
        name="GODOT" geometry={TorusKnot} color="#478cbf" dist={15} speed={0.15} 
        args={[0.6, 0.2, 128, 32]} isFocused={activeSector === 'GODOT'} isActive={true} ref={godotRef}
        hasMoon={true}
      />
      <Planet 
        name="AI" geometry={Sphere} color="#8b00ff" dist={22} speed={0.1} 
        args={[0.8, 64, 64]} isFocused={activeSector === 'AI'} isActive={true} ref={aiRef}
        hasCloud={true}
      />
      <Planet 
        name="ROBOT" geometry={Octahedron} color="#ff4500" dist={30} speed={0.07} 
        args={[0.8, 0]} isFocused={activeSector === 'ROBOT'} isActive={true} ref={robotRef}
        hasRings={true}
      />

      <Planet geometry={Sphere} color="#aaaaaa" dist={8} speed={0.4} args={[0.2, 32, 32]} />
      <Planet geometry={Sphere} color="#e3bb76" dist={11} speed={0.3} args={[0.35, 32, 32]} />
      <Planet geometry={Sphere} color="#2277ff" dist={18} speed={0.12} args={[0.4, 32, 32]} />
    </group>
  )
})

const Sun = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
  })
  return (
    <group>
      <Sphere ref={meshRef} args={[2.5, 64, 64]}>
        <MeshDistortMaterial color="#050505" emissive="#32cd32" emissiveIntensity={active ? 15 : 5} distort={0.4} speed={2} />
      </Sphere>
      <pointLight intensity={10} color="#32cd32" distance={60} />
      <Sphere args={[2.7, 32, 32]}>
        <meshBasicMaterial color="#32cd32" transparent opacity={0.05} side={THREE.BackSide} />
      </Sphere>
    </group>
  )
}

const Planet = forwardRef(({ geometry: Geo, color, dist, speed, args, isFocused, isActive, hasMoon, hasCloud, hasRings }: any, ref: any) => {
  const orbitRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    orbitRef.current.rotation.y = t * speed
    meshRef.current.rotation.y = t * 0.5
    if (isActive && meshRef.current) {
      const targetScale = isFocused ? 1.5 : 1.0
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group>
      <Ring args={[dist, dist + 0.02, 128]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="white" transparent opacity={0.03} side={THREE.DoubleSide} />
      </Ring>

      <group ref={orbitRef}>
        <group position={[dist, 0, 0]} ref={ref}>
          <mesh ref={meshRef}>
            <Geo args={args}>
              <MeshDistortMaterial
                color="#020202" emissive={color} emissiveIntensity={isFocused ? 15 : (isActive ? 2 : 0.5)}
                distort={isActive ? 0.3 : 0} speed={isActive ? 2 : 0} metalness={1}
              />
            </Geo>
          </mesh>

          {hasMoon && (
            <Float speed={5} rotationIntensity={2} floatIntensity={2}>
              <mesh position={[1.5, 0.5, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color={color} wireframe />
              </mesh>
            </Float>
          )}

          {hasCloud && (
            <Sphere args={[1.2, 32, 32]}>
              <meshPhongMaterial color={color} transparent opacity={0.1} wireframe />
            </Sphere>
          )}

          {hasRings && (
            <group rotation={[Math.PI/3, 0, 0]}>
              <Ring args={[1.2, 1.3, 64]}><meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} /></Ring>
              <Ring args={[1.4, 1.45, 64]}><meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} /></Ring>
            </group>
          )}

          {isActive && <pointLight color={color} intensity={isFocused ? 8 : 1} distance={15} />}
        </group>
      </group>
    </group>
  )
})

XanthanSystem.displayName = 'XanthanSystem'
export default XanthanSystem
