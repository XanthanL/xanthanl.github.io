import { Suspense, useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, CameraControls } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EffectComposer, 
  Bloom, 
  Noise, 
  Vignette,
  ChromaticAberration,
  Scanline
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import XanthanSystem from './components/XanthanSystem'
import BackgroundElements from './components/BackgroundElements'
import StarField from './components/StarField'
import * as THREE from 'three'

type Sector = 'GODOT' | 'AI' | 'ROBOT' | 'CORE'

const CameraTracker = ({ activeSector, systemRef, controlsRef }: any) => {
  useFrame(() => {
    if (!controlsRef.current || !systemRef.current) return
    const targetPos = systemRef.current.getPlanetPosition(activeSector)
    controlsRef.current.setTarget(targetPos.x, targetPos.y, targetPos.z, true)
  })
  return null
}

const MeteorSystem = () => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [target, setTarget] = useState(new THREE.Vector3(0, 0, 0))
  const [pos, setPos] = useState(new THREE.Vector3(-100, 0, 0))
  const [active, setActive] = useState(false)

  useFrame((state) => {
    if (!active && Math.random() > 0.995) {
      setPos(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*50, -50))
      setTarget(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*50, 100))
      setActive(true)
    }
    if (active) {
      pos.lerp(target, 0.05)
      meshRef.current.position.copy(pos)
      if (pos.distanceTo(target) < 1) setActive(false)
    }
  })

  return (
    <mesh ref={meshRef} visible={active}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      <pointLight color="#ffffff" intensity={2} distance={10} />
    </mesh>
  )
}

function App() {
  const [activeSector, setActiveSector] = useState<Sector>('CORE')
  const [isWarping, setIsWarping] = useState(false)
  const cameraControlsRef = useRef<CameraControls>(null!)
  const xanthanSystemRef = useRef<any>(null!)

  const sectorConfig = {
    CORE: { label: 'SOL_01', id: '01' },
    GODOT: { label: 'GDT_02', id: '02' },
    AI: { label: 'NET_03', id: '03' },
    ROBOT: { label: 'MCH_04', id: '04' },
  }

  useEffect(() => {
    if (!cameraControlsRef.current) return
    const posMap = {
      CORE: [0, 20, 45],
      GODOT: [25, 10, 20],
      AI: [-35, 10, 20],
      ROBOT: [0, 10, 60]
    }
    const [px, py, pz] = posMap[activeSector]
    cameraControlsRef.current.setPosition(px, py, pz, true)
  }, [activeSector])

  const handleSectorChange = (s: Sector) => {
    if (s === activeSector) return
    setIsWarping(true)
    setTimeout(() => {
      setActiveSector(s)
      setIsWarping(false)
    }, 800)
  }

  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden text-white font-mono select-none uppercase tracking-tighter">
      <BackgroundElements />
      
      <div className="absolute inset-0 z-0">
        <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
          <CameraControls ref={cameraControlsRef} makeDefault />
          <ambientLight intensity={0.1} />
          
          <Suspense fallback={null}>
            <StarField isWarping={isWarping} />
            <XanthanSystem ref={xanthanSystemRef} activeSector={activeSector} />
            <CameraTracker activeSector={activeSector} systemRef={xanthanSystemRef} controlsRef={cameraControlsRef} />
            <MeteorSystem />

            <EffectComposer disableNormalPass multisampling={0}>
              <Bloom intensity={2.0} luminanceThreshold={0.1} mipmapBlur blendFunction={BlendFunction.SCREEN} />
              <Scanline opacity={0.02} density={1.0} />
              <Noise opacity={0.05} />
              <Vignette darkness={1.2} />
              <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* MINIMALIST CELESTIAL UI */}
      <div className="relative z-10 w-full h-full pointer-events-none p-10 flex flex-col justify-between">
        <header className="flex justify-between items-start">
          <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
            <span className="text-lg font-black tracking-[0.3em]">XANTHAN_OBS</span>
            <span className="text-[8px] opacity-30 tracking-[0.5em]">DEEP_SPACE_TRACKING_MODE</span>
          </div>
          <div className="text-[10px] text-right opacity-40 leading-relaxed">
            LOCKED: {activeSector}<br />
            STATUS: NOMINAL
          </div>
        </header>

        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-96 h-96 border border-white/5 rounded-full flex items-center justify-center">
            <div className="w-[1px] h-full bg-white/10 absolute" />
            <div className="w-full h-[1px] bg-white/10 absolute" />
          </div>
        </div>

        <footer className="flex justify-between items-end pointer-events-auto">
          <div className="flex flex-col gap-4">
            {(Object.keys(sectorConfig) as Sector[]).map((s) => (
              <button
                key={s}
                onClick={() => handleSectorChange(s)}
                className={`group flex items-center gap-4 transition-all duration-500`}
              >
                <span className={`text-xs ${activeSector === s ? 'text-primary font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
                  {sectorConfig[s].id}
                </span>
                <div className={`h-[1px] transition-all duration-500 ${activeSector === s ? 'w-16 bg-primary' : 'w-4 bg-white/10'}`} />
                <span className={`text-[10px] tracking-[0.2em] transition-all duration-500 ${activeSector === s ? 'opacity-100' : 'opacity-0'}`}>
                  {sectorConfig[s].label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-end gap-6">
            <div className="text-right">
              <div className="text-[8px] opacity-30 mb-1 tracking-[0.2em]">Target_Locked</div>
              <div className="text-7xl font-black tracking-tighter leading-none italic text-primary/90">{sectorConfig[activeSector].label}</div>
            </div>
            
            <div className="flex gap-10 text-[8px] opacity-40 border-t border-white/10 pt-4">
              <div className="flex flex-col">
                <span>COORD_RA</span>
                <span className="font-black text-white">{(Math.random()*24).toFixed(2)}H</span>
              </div>
              <div className="flex flex-col">
                <span>DISTANCE</span>
                <span className="font-black text-white">{(Math.random()*500 + 100).toFixed(2)} LY</span>
              </div>
              <div className="flex flex-col">
                <span>TEMP_CORE</span>
                <span className="font-black text-primary">5,778 K</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
