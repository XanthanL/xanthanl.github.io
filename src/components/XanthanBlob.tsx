import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, MeshWobbleMaterial, Icosahedron, Ring, TorusKnot, Octahedron } from '@react-three/drei'
import * as THREE from 'three'

interface XanthanBlobProps {
  mode: 'GODOT' | 'AI' | 'ROBOT' | 'CORE'
  color: string
}

const XanthanBlob = ({ mode, color }: XanthanBlobProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<any>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!)
  
  const { mouse, viewport } = useThree()

  const settings = useMemo(() => {
    switch (mode) {
      case 'GODOT': return { distort: 0.3, speed: 4, emissiveIntensity: 3 }
      case 'AI': return { distort: 1.2, speed: 2, emissiveIntensity: 10 }
      case 'ROBOT': return { distort: 0.05, speed: 12, emissiveIntensity: 2 }
      default: return { distort: 0.5, speed: 2, emissiveIntensity: 4 }
    }
  }, [mode])

  // --- PERFORMANCE OPTIMIZATION: Instanced Mesh for Particles ---
  const fragmentCount = 100
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < fragmentCount; i++) {
      const r = 4 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      temp.push({
        x: r * Math.cos(theta),
        y: (Math.random() - 0.5) * 5,
        z: r * Math.sin(theta),
        speed: 0.1 + Math.random() * 0.4,
        offset: Math.random() * 100
      })
    }
    return temp
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const targetX = (mouse.x * viewport.width) / 2
    const targetY = (mouse.y * viewport.height) / 2
    
    // Smooth transitions for main body
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, time * 0.1 + targetY * 0.2, 0.1)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, time * 0.15 + targetX * 0.2, 0.1)
    }

    if (materialRef.current) {
      const mouseDist = Math.sqrt(mouse.x ** 2 + mouse.y ** 2)
      const hoverImpact = Math.max(0, 1.2 - mouseDist) * 0.8
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, settings.distort + hoverImpact + Math.sin(time) * 0.1, 0.1)
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, settings.speed + hoverImpact * 8, 0.1)
    }

    if (innerRef.current) {
      innerRef.current.rotation.z = -time * 1.5
      innerRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.15 + (1 - Math.sqrt(mouse.x**2 + mouse.y**2)) * 0.4)
    }

    // --- Instanced Particles Update ---
    particles.forEach((p, i) => {
      const { x, y, z, speed, offset } = p
      const t = time * speed + offset
      
      dummy.position.set(
        x + Math.sin(t) * 2 + (mouse.x * viewport.width / 2 - x) * 0.03,
        y + Math.cos(t) * 2 + (mouse.y * viewport.height / 2 - y) * 0.03,
        z
      )
      dummy.rotation.set(t, t, t)
      dummy.scale.setScalar(0.02)
      dummy.updateMatrix()
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
    })
    instancedMeshRef.current.instanceMatrix.needsUpdate = true

    // Rings
    if (ring1Ref.current) { ring1Ref.current.rotation.x = time * 0.8; ring1Ref.current.rotation.y = time * 0.4 }
    if (ring2Ref.current) { ring2Ref.current.rotation.y = -time * 0.6; ring2Ref.current.rotation.z = time * 0.5 }
  })

  const Geometry = useMemo(() => {
    switch (mode) {
      case 'GODOT': return TorusKnot
      case 'AI': return Sphere
      case 'ROBOT': return Octahedron
      default: return Sphere
    }
  }, [mode])

  return (
    <group>
      {/* HUD Orbitals */}
      <Ring ref={ring1Ref} args={[2.5, 2.52, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </Ring>
      <Ring ref={ring2Ref} args={[3.0, 3.01, 64]} rotation={[0, Math.PI / 4, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </Ring>

      {/* Main Celestial Entity */}
      <Geometry ref={meshRef} args={mode === 'GODOT' ? [0.8, 0.3, 128, 32] : [1.2, 64, 64]} scale={1.5}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#010101"
          roughness={0.1}
          metalness={1}
          distort={settings.distort}
          speed={settings.speed}
          emissive={color}
          emissiveIntensity={settings.emissiveIntensity}
        />
      </Geometry>
      
      {/* Pulsing Singularity */}
      <mesh ref={innerRef}>
        <Icosahedron args={[0.5, 1]}>
          <MeshWobbleMaterial color={color} factor={2} speed={4} emissive={color} emissiveIntensity={10} wireframe />
        </Icosahedron>
      </mesh>

      {/* Optimized Particles (100 fragments, 1 Draw Call) */}
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, fragmentCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </instancedMesh>
    </group>
  )
}

export default XanthanBlob
