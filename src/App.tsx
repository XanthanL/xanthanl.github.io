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
import { ExternalLink, Github, Copy, ChevronUp } from 'lucide-react'
import XanthanSystem from './components/XanthanSystem'
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
  // 手机端卡片默认折叠成标题栏，避免遮挡宇宙画面；桌面端始终展开
  const [cardOpen, setCardOpen] = useState(false)
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
          </div>
        </header>

        {/* 准星装饰 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-96 h-96 border border-white/5 rounded-full flex items-center justify-center">
            <div className="w-[1px] h-full bg-white/10 absolute" />
            <div className="w-full h-[1px] bg-white/10 absolute" />
          </div>
        </div>

        {/* 项目信息卡片：桌面端右侧悬浮，手机端底部抽屉 */}
        <div className="absolute pointer-events-auto left-0 right-0 bottom-0 md:left-auto md:right-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[360px]">
          <AnimatePresence mode="wait">
            {!isWarping && (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="border border-white/10 bg-black/70 backdrop-blur-md p-4 md:p-6 flex flex-col gap-3 md:gap-4 max-h-[52vh] md:max-h-[72vh] overflow-y-auto"
                style={{ borderLeftColor: sector.color, borderLeftWidth: 2 }}
              >
                <button
                  className="flex justify-between items-start w-full text-left md:pointer-events-none"
                  onClick={() => setCardOpen((o) => !o)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] tracking-[0.4em] opacity-40">TARGET_{sector.index} // {sector.label}</span>
                    <span className="text-lg md:text-xl font-black tracking-tight normal-case" style={{ color: sector.color }}>{sector.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-2 h-2 animate-pulse" style={{ background: sector.color }} />
                    <ChevronUp size={14} className={`md:hidden opacity-60 transition-transform duration-300 ${cardOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <div className={`${cardOpen ? 'flex' : 'hidden'} md:flex flex-col gap-3 md:gap-4`}>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="flex justify-between items-end pointer-events-auto mb-20 md:mb-0">
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
              <div className="text-4xl md:text-7xl font-black tracking-tighter leading-none italic" style={{ color: sector.color }}>
                {sector.label}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
