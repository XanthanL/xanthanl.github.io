import { useRef, useState, forwardRef, useImperativeHandle, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Ring, Float, Html } from '@react-three/drei'
import * as THREE from 'three'
import { SECTORS, Sector } from '../data/projects'

interface XanthanSystemProps {
  activeSector: string
  onSelect: (id: string) => void
}

const XanthanSystem = forwardRef(({ activeSector, onSelect }: XanthanSystemProps, ref) => {
  const bodyRefs = useRef<Record<string, THREE.Group | null>>({})

  useImperativeHandle(ref, () => ({
    getPlanetPosition: (id: string) => {
      const target = bodyRefs.current[id]
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
      {SECTORS.map((sector) =>
        sector.kind === 'sun' ? (
          <group key={sector.id} ref={(el) => (bodyRefs.current[sector.id] = el)}>
            <Sun
              sector={sector}
              isFocused={activeSector === sector.id}
              onSelect={onSelect}
            />
          </group>
        ) : (
          <Planet
            key={sector.id}
            sector={sector}
            isFocused={activeSector === sector.id}
            onSelect={onSelect}
            ref={(el: THREE.Group | null) => (bodyRefs.current[sector.id] = el)}
          />
        )
      )}
    </group>
  )
})

const setCursor = (c: string) => (document.body.style.cursor = c)

const Sun = ({ sector, isFocused, onSelect }: { sector: Sector; isFocused: boolean; onSelect: (id: string) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
  })
  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect(sector.id) }}
      onPointerOver={(e) => { e.stopPropagation(); setCursor('pointer') }}
      onPointerOut={() => setCursor('auto')}
    >
      <Sphere ref={meshRef} args={[sector.size, 64, 64]}>
        <MeshDistortMaterial color="#050505" emissive={sector.color} emissiveIntensity={isFocused ? 8 : 3.5} distort={0.4} speed={2} />
      </Sphere>
      <pointLight intensity={6} color={sector.color} distance={60} />
      <Sphere args={[sector.size + 0.2, 32, 32]}>
        <meshBasicMaterial color={sector.color} transparent opacity={0.03} side={THREE.BackSide} />
      </Sphere>
    </group>
  )
}

const PlanetGeo = ({ kind, size }: { kind: Sector['kind']; size: number }) => {
  switch (kind) {
    case 'torusKnot': return <torusKnotGeometry args={[size * 0.75, size * 0.25, 128, 32]} />
    case 'torus': return <torusGeometry args={[size * 0.85, size * 0.38, 32, 64]} />
    case 'octahedron': return <octahedronGeometry args={[size, 0]} />
    case 'icosahedron': return <icosahedronGeometry args={[size, 0]} />
    case 'dodecahedron': return <dodecahedronGeometry args={[size, 0]} />
    case 'box': return <boxGeometry args={[size * 1.4, size * 1.4, size * 1.4]} />
    case 'gasGiant': return <sphereGeometry args={[size, 96, 96]} />
    default: return <sphereGeometry args={[size, 64, 64]} />
  }
}

// 每种形态的专属质感：多面体保持锋利棱角，气态巨星缓慢涌动
const KIND_MATERIAL: Record<string, { distort: number; speed: number; metalness: number; roughness?: number }> = {
  sphere: { distort: 0.3, speed: 2, metalness: 1 },
  torusKnot: { distort: 0.25, speed: 2, metalness: 1 },
  torus: { distort: 0.15, speed: 1.5, metalness: 0.8 },
  octahedron: { distort: 0, speed: 0, metalness: 1 },
  icosahedron: { distort: 0, speed: 0, metalness: 0.9 },
  dodecahedron: { distort: 0.08, speed: 1, metalness: 0.6 },
  box: { distort: 0, speed: 0, metalness: 1 },
  gasGiant: { distort: 0.45, speed: 0.8, metalness: 0.3 },
}

const Planet = forwardRef(({ sector, isFocused, onSelect }: { sector: Sector; isFocused: boolean; onSelect: (id: string) => void }, ref: any) => {
  const orbitRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  // 随机初始相位，避免所有行星排成一条直线
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    orbitRef.current.rotation.y = phase + t * sector.speed
    meshRef.current.rotation.y = t * 0.5
    const targetScale = isFocused ? 1.5 : hovered ? 1.25 : 1.0
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  const highlight = isFocused || hovered

  return (
    <group>
      {/* 轨道线 */}
      <Ring args={[sector.dist, sector.dist + 0.02, 128]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={highlight ? sector.color : 'white'} transparent opacity={highlight ? 0.15 : 0.03} side={THREE.DoubleSide} />
      </Ring>

      <group ref={orbitRef}>
        <group position={[sector.dist, 0, 0]} ref={ref}>
          <mesh
            ref={meshRef}
            onClick={(e) => { e.stopPropagation(); onSelect(sector.id) }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setCursor('pointer') }}
            onPointerOut={() => { setHovered(false); setCursor('auto') }}
          >
            <PlanetGeo kind={sector.kind} size={sector.size} />
            <MeshDistortMaterial
              color="#020202" emissive={sector.color} emissiveIntensity={isFocused ? 4 : hovered ? 3.5 : 2}
              distort={KIND_MATERIAL[sector.kind]?.distort ?? 0.3}
              speed={KIND_MATERIAL[sector.kind]?.speed ?? 2}
              metalness={KIND_MATERIAL[sector.kind]?.metalness ?? 1}
              flatShading={['octahedron', 'icosahedron', 'dodecahedron', 'box'].includes(sector.kind)}
            />
          </mesh>

          {/* 扩大点击热区（行星本体太小不好点） */}
          <mesh
            visible={false}
            onClick={(e) => { e.stopPropagation(); onSelect(sector.id) }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setCursor('pointer') }}
            onPointerOut={() => { setHovered(false); setCursor('auto') }}
          >
            <sphereGeometry args={[Math.max(sector.size * 2.2, 1.2), 16, 16]} />
          </mesh>

          {/* hover 时的目标标签 */}
          {hovered && !isFocused && (
            <Html center distanceFactor={30} style={{ pointerEvents: 'none' }}>
              <div className="flex flex-col items-center gap-1 -translate-y-10 font-mono whitespace-nowrap">
                <span className="text-[10px] tracking-[0.3em] px-2 py-1 border" style={{ color: sector.color, borderColor: `${sector.color}66`, background: 'rgba(0,0,0,0.6)' }}>
                  {sector.label} // {sector.name}
                </span>
                <span className="text-[8px] text-white/40 tracking-[0.2em]">CLICK_TO_LOCK</span>
              </div>
            </Html>
          )}

          {sector.moon && (
            <Float speed={5} rotationIntensity={2} floatIntensity={2}>
              <mesh position={[sector.size * 2.2, sector.size, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color={sector.color} wireframe />
              </mesh>
            </Float>
          )}

          {sector.cloud && (
            <Sphere args={[sector.size * 1.5, 32, 32]}>
              <meshPhongMaterial color={sector.color} transparent opacity={0.1} wireframe />
            </Sphere>
          )}

          {sector.rings && (
            <group rotation={[Math.PI / 3, 0, 0]}>
              <Ring args={[sector.size * 1.5, sector.size * 1.65, 64]}><meshBasicMaterial color={sector.color} transparent opacity={0.3} side={THREE.DoubleSide} /></Ring>
              <Ring args={[sector.size * 1.75, sector.size * 1.82, 64]}><meshBasicMaterial color={sector.color} transparent opacity={0.1} side={THREE.DoubleSide} /></Ring>
            </group>
          )}

          <pointLight color={sector.color} intensity={isFocused ? 5 : hovered ? 3 : 1} distance={15} />
        </group>
      </group>
    </group>
  )
})

Planet.displayName = 'Planet'
XanthanSystem.displayName = 'XanthanSystem'
export default XanthanSystem
