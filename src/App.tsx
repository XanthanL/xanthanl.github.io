import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  ChromaticAberration,
  Scanline
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, Copy } from 'lucide-react'
import XanthanSystem from './components/XanthanSystem'
import BackgroundElements from './components/BackgroundElements'
import StarField from './components/StarField'
import { SECTORS, getSector } from './data/projects'
import * as THREE from 'three'

const CameraTracker = ({ activeSector, systemRef, controlsRef }: any) => {
  const initialized = useRef(false)
  useFrame(() => {
    if (!controlsRef.current || !systemRef.current) return
    // 首帧初始化相机位置（App 的 useEffect 首次执行时 ref 尚未挂载）
    if (!initialized.current) {
      controlsRef.current.setPosition(0, 20, 45, false)
      initialized.current = true
    }
    const targetPos = systemRef.current.getPlanetPosition(activeSector)
    controlsRef.current.setTarget(targetPos.x, targetPos.y, targetPos.z, true)
  })
  return null
}

const MeteorSystem = () => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [target] = useState(new THREE.Vector3(0, 0, 0))
  const [pos] = useState(new THREE.Vector3(-100, 0, 0))
  const [active, setActive] = useState(false)

  useFrame(() => {
    if (!active && Math.random() > 0.995) {
      pos.set((Math.random()-0.5)*100, (Math.random()-0.5)*50, -50)
      target.set((Math.random()-0.5)*100, (Math.random()-0.5)*50, 100)
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
  const [activeSector, setActiveSector] = useState('CORE')
  const [isWarping, setIsWarping] = useState(false)
  const cameraControlsRef = useRef<CameraControls>(null!)
  const xanthanSystemRef = useRef<any>(null!)

  const sector = getSector(activeSector)

  useEffect(() => {
    if (!cameraControlsRef.current) return
    if (sector.kind === 'sun') {
      cameraControlsRef.current.setPosition(0, 20, 45, true)
    } else {
      // 相机跟随目标行星：先取行星当前位置，再退到一个合适的观察距离
      const p = xanthanSystemRef.current?.getPlanetPosition(sector.id) ?? new THREE.Vector3()
      const viewDist = 12 + sector.size * 8
      const dir = p.clone().normalize()
      const camPos = p.clone().add(dir.multiplyScalar(viewDist)).add(new THREE.Vector3(0, viewDist * 0.45, 0))
      cameraControlsRef.current.setPosition(camPos.x, camPos.y, camPos.z, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSector])

  const handleSectorChange = (id: string) => {
    if (id === activeSector) return
    setIsWarping(true)
    setTimeout(() => {
      setActiveSector(id)
      setIsWarping(false)
    }, 800)
  }

  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden text-white font-mono select-none tracking-tighter">
      <BackgroundElements />

      <div className="absolute inset-0 z-0">
        <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
          <CameraControls ref={cameraControlsRef} makeDefault />
          <ambientLight intensity={0.1} />

          <Suspense fallback={null}>
            <StarField isWarping={isWarping} />
            <XanthanSystem ref={xanthanSystemRef} activeSector={activeSector} onSelect={handleSectorChange} />
            <CameraTracker activeSector={activeSector} systemRef={xanthanSystemRef} controlsRef={cameraControlsRef} />
            <MeteorSystem />

            <EffectComposer multisampling={0}>
              <Bloom intensity={2.0} luminanceThreshold={0.1} mipmapBlur blendFunction={BlendFunction.SCREEN} />
              <Scanline opacity={0.02} density={1.0} />
              <Noise opacity={0.05} />
              <Vignette darkness={1.2} />
              <ChromaticAberration
                offset={new THREE.Vector2(0.0008, 0.0008)}
                radialModulation={false}
                modulationOffset={0}
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 w-full h-full pointer-events-none p-6 md:p-10 flex flex-col justify-between uppercase">
        <header className="flex justify-between items-start">
          <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
            <span className="text-lg font-black tracking-[0.3em]">XANTHAN_OBS</span>
            <span className="text-[8px] opacity-30 tracking-[0.5em]">PROJECT_CONSTELLATION // {SECTORS.length - 1}_DEPLOYED</span>
          </div>
          <div className="text-[10px] text-right opacity-40 leading-relaxed">
            LOCKED: {sector.label}<br />
            STATUS: {isWarping ? 'WARPING...' : 'NOMINAL'}
          </div>
        </header>

        {/* 准星装饰 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-96 h-96 border border-white/5 rounded-full flex items-center justify-center">
            <div className="w-[1px] h-full bg-white/10 absolute" />
            <div className="w-full h-[1px] bg-white/10 absolute" />
          </div>
        </div>

        {/* 项目信息卡片 */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-[300px] md:w-[360px] pointer-events-auto">
          <AnimatePresence mode="wait">
            {!isWarping && (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="border border-white/10 bg-black/60 backdrop-blur-md p-6 flex flex-col gap-4 max-h-[72vh] overflow-y-auto"
                style={{ borderLeftColor: sector.color, borderLeftWidth: 2 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] tracking-[0.4em] opacity-40">TARGET_{sector.index} // {sector.label}</span>
                    <span className="text-xl font-black tracking-tight normal-case" style={{ color: sector.color }}>{sector.name}</span>
                  </div>
                  <div className="w-2 h-2 mt-1 animate-pulse" style={{ background: sector.color }} />
                </div>

                <p className="text-[11px] leading-relaxed opacity-70 normal-case tracking-normal">
                  {sector.desc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {sector.tags.map((tag) => (
                    <span key={tag} className="text-[8px] tracking-[0.2em] px-2 py-1 border border-white/15 opacity-60">{tag}</span>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <a
                    href={sector.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center justify-between px-4 py-3 border transition-all duration-300 hover:bg-white/5"
                    style={{ borderColor: `${sector.color}66` }}
                  >
                    <span className="text-[10px] tracking-[0.3em] font-bold" style={{ color: sector.color }}>
                      {sector.kind === 'sun' ? 'VIEW_GITHUB' : 'ESTABLISH_LINK'}
                    </span>
                    <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: sector.color }} />
                  </a>
                  <div className="flex gap-2">
                    {sector.mirror && (
                      <a
                        href={sector.mirror} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-white/10 text-[8px] tracking-[0.2em] opacity-50 hover:opacity-100 hover:border-white/30 transition-all"
                      >
                        <Copy size={10} /> MIRROR
                      </a>
                    )}
                    {sector.repo && (
                      <a
                        href={sector.repo} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-white/10 text-[8px] tracking-[0.2em] opacity-50 hover:opacity-100 hover:border-white/30 transition-all"
                      >
                        <Github size={10} /> SOURCE
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="flex justify-between items-end pointer-events-auto">
          {/* 星区导航 */}
          <div className="flex flex-col gap-2.5">
            {SECTORS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSectorChange(s.id)}
                className="group flex items-center gap-4 transition-all duration-500"
              >
                <span className={`text-xs ${activeSector === s.id ? 'font-bold' : 'text-white/20 group-hover:text-white/50'}`}
                      style={activeSector === s.id ? { color: s.color } : undefined}>
                  {s.index}
                </span>
                <div className="h-[1px] transition-all duration-500"
                     style={activeSector === s.id
                       ? { width: 64, background: s.color }
                       : { width: 16, background: 'rgba(255,255,255,0.1)' }} />
                <span className={`text-[10px] tracking-[0.2em] transition-all duration-500 ${activeSector === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-end gap-6">
            <div className="text-right">
              <div className="text-[8px] opacity-30 mb-1 tracking-[0.2em]">Target_Locked</div>
              <div className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic" style={{ color: sector.color }}>
                {sector.label}
              </div>
            </div>

            <div className="flex gap-10 text-[8px] opacity-40 border-t border-white/10 pt-4">
              <div className="flex flex-col">
                <span>ORBIT_RADIUS</span>
                <span className="font-black text-white">{sector.dist.toFixed(1)} AU</span>
              </div>
              <div className="flex flex-col">
                <span>ORBIT_PERIOD</span>
                <span className="font-black text-white">{sector.speed > 0 ? (2 * Math.PI / sector.speed).toFixed(1) : '∞'} S</span>
              </div>
              <div className="flex flex-col">
                <span>SIGNAL</span>
                <span className="font-black" style={{ color: sector.color }}>ONLINE</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
