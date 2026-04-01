import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Float, Grid } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FlaskConical, 
  Cpu, 
  Gamepad2, 
  Rocket, 
  Activity, 
  Zap, 
  Target,
  ChevronRight,
  Terminal
} from 'lucide-react'
import { 
  EffectComposer, 
  Bloom, 
  Noise, 
  ChromaticAberration, 
  Vignette,
  Glitch,
  Scanline
} from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import XanthanBlob from './components/XanthanBlob'
import BackgroundElements from './components/BackgroundElements'
import StarField from './components/StarField'
import { useEffect, useRef } from 'react'

type Sector = 'GODOT' | 'AI' | 'ROBOT' | 'CORE'

function App() {
  const [activeSector, setActiveSector] = useState<Sector>('CORE')
  const [isGlitching, setIsGlitching] = useState(false)
  const [terminalText, setTerminalText] = useState('')
  const fullTextRef = useRef('')

  const sectorConfig = {
    CORE: { color: '#32cd32', accent: '#8b00ff', icon: <FlaskConical />, label: 'X_01', msg: 'ESTABLISHING_STATION_LINK_7.4LY...' },
    GODOT: { color: '#478cbf', accent: '#ffffff', icon: <Gamepad2 />, label: 'G_02', msg: 'SCANNING_CELESTIAL_BODY_CONSTRUCTS...' },
    AI: { color: '#8b00ff', accent: '#00ffff', icon: <Cpu />, label: 'A_03', msg: 'DECODING_EXTRATERRESTRIAL_NEURAL_SIGNALS...' },
    ROBOT: { color: '#ff4500', accent: '#ffd700', icon: <Rocket />, label: 'R_04', msg: 'ORBITAL_KINEMATICS_CALCULATED_VOYAGER_09.' },
  }

  // Sector Switch Logic with Glitch
  const handleSectorChange = (s: Sector) => {
    if (s === activeSector) return
    setIsGlitching(true)
    setTimeout(() => {
      setActiveSector(s)
      setIsGlitching(false)
    }, 300)
  }

  // Terminal Typewriter Effect
  useEffect(() => {
    fullTextRef.current = sectorConfig[activeSector].msg
    setTerminalText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < fullTextRef.current.length) {
        setTerminalText((prev) => prev + fullTextRef.current[i])
        i++
      } else {
        clearInterval(interval)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [activeSector])

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden text-white font-mono select-none">
      <BackgroundElements />
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: false, alpha: true, stencil: false, depth: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={3} color={sectorConfig[activeSector].color} />
          <pointLight position={[-10, -10, -10]} intensity={2} color={sectorConfig[activeSector].accent} />
          
          <Suspense fallback={null}>
            <StarField />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <XanthanBlob mode={activeSector} color={sectorConfig[activeSector].color} />
            </Float>
            <Grid 
              infiniteGrid 
              fadeDistance={25} 
              sectionColor={sectorConfig[activeSector].color} 
              sectionOpacity={0.04} 
              cellColor="#222"
              cellOpacity={0.02}
              position={[0, -2.5, 0]}
            />

            <EffectComposer disableNormalPass multisampling={0}>
              <Bloom 
                intensity={1.2} 
                luminanceThreshold={0.2} 
                mipmapBlur
                blendFunction={BlendFunction.SCREEN} 
              />
              <Noise opacity={0.06} />
              <Vignette darkness={1.2} />
              <Scanline opacity={0.03} density={1.5} />
              <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
              {isGlitching && (
                <Glitch 
                  delay={new THREE.Vector2(0, 0)} 
                  duration={new THREE.Vector2(0.1, 0.3)} 
                  strength={new THREE.Vector2(0.3, 0.7)}
                  mode={GlitchMode.CONSTANT_WILD} 
                />
              )}
            </EffectComposer>
          </Suspense>

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Interface Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none p-6 md:p-10">
        
        {/* Top: Status Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-xl font-black tracking-tighter">
              <div className={`w-2 h-2 rounded-full ${isGlitching ? 'bg-white' : 'bg-primary'} animate-pulse transition-colors`} />
              XANTHAN_OBSERVATORY <span className="opacity-20">/</span> {sectorConfig[activeSector].label}
            </div>
            <div className="text-[10px] opacity-40 flex gap-4">
              <span className="flex items-center gap-1 font-bold"><Activity size={10} className="text-primary" /> LINK_ESTABLISHED</span>
              <span className="flex items-center gap-1 font-bold"><Zap size={10} className="text-primary" /> PWR_STABLE_100%</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            {Object.keys(sectorConfig).map((s) => (
              <button
                key={s}
                onClick={() => handleSectorChange(s as Sector)}
                className={`group relative w-12 h-12 flex items-center justify-center border transition-all duration-300 ${
                  activeSector === s 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-white border-white/5 hover:border-white/40'
                }`}
              >
                <div className={`absolute inset-0 opacity-10 group-hover:bg-white/10 transition-colors`} />
                {sectorConfig[s as Sector].icon}
              </button>
            ))}
          </div>
        </div>

        {/* Center-Right: Metrics HUD */}
        <div className="flex-1 flex items-center justify-end pr-10">
          <div className="flex flex-col gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-end gap-2 group">
                <div className="flex items-center gap-4">
                  <div className="text-[8px] opacity-30 text-right">
                    COSMIC_BUFFER_0{i}<br />
                    HEX_VAL: 0x{Math.random().toString(16).slice(2, 6).toUpperCase()}
                  </div>
                  <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-[10px] font-bold group-hover:border-primary/50 transition-colors">
                    {(Math.random() * 99).toFixed(1)}
                  </div>
                </div>
                <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden">
                  <motion.div 
                    animate={{ x: [-100, 200] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Interactive Terminal */}
        <div className="mt-auto flex justify-between items-end pointer-events-auto">
          <div className="w-full max-w-lg">
            <div className="bg-black/80 border border-white/5 p-5 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
              <div className="flex items-center justify-between mb-3 text-[10px] opacity-60">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-primary" /> 
                  <span className="tracking-widest underline decoration-primary/40">DEEP_SPACE_OUTPUT_LOG</span>
                </div>
                <div>TS_{Date.now().toString().slice(-8)}</div>
              </div>
              <div className="text-[13px] h-10 font-medium tracking-tight text-primary/90">
                {terminalText}<span className="inline-block w-2 h-4 ml-1 bg-primary/60 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 ml-10">
            <div className="flex items-center gap-5">
               <div className="text-right">
                  <div className="text-[8px] opacity-40 mb-1">TARGET_COORDINATES</div>
                  <div className="text-4xl font-black tracking-tighter leading-none">{sectorConfig[activeSector].label}</div>
               </div>
               <div className="w-16 h-16 border-2 border-primary flex items-center justify-center animate-spin-slow">
                 <Target size={32} className="text-primary" />
               </div>
            </div>
            <button className="group relative px-8 py-3 bg-primary text-black font-black text-[11px] tracking-[0.3em] overflow-hidden">
              <span className="relative z-10">INIT_WARP_DRIVE</span>
              <motion.div 
                className="absolute inset-0 bg-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Matrix Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.1] mix-blend-overlay">
        <svg width="100%" height="100%">
          <pattern id="dotGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.5" fill="white" />
            <line x1="0" y1="0" x2="10" y2="0" stroke="white" strokeWidth="0.1" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="white" strokeWidth="0.1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
      </div>
    </div>
  )
}

export default App
