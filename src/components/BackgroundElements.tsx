import { useEffect, useState, useMemo } from 'react'

const BackgroundElements = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  // 信号强度只生成一次，避免鼠标移动时数值疯狂跳变
  const signals = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 120)), [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 font-mono text-[8px]">
      {/* Moving cosmic coordinate tracker */}
      <div 
        className="absolute transition-all duration-75 ease-out"
        style={{ left: coords.x + 20, top: coords.y + 20 }}
      >
        <div className="flex flex-col border-l border-t border-white/20 p-2">
          <span>RA: {(coords.x / 10).toFixed(2)}h</span>
          <span>DEC: {(coords.y / 10).toFixed(2)}°</span>
          <span>DIST: {(coords.x * 0.01).toFixed(3)} LY</span>
          <div className="w-10 h-[1px] bg-primary/40 mt-1" />
        </div>
      </div>

      {/* Grid of cosmic register codes */}
      <div className="absolute bottom-10 left-10 grid grid-cols-4 gap-4 opacity-50">
        {signals.map((s, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[6px]">SIGNAL_STRENGTH</span>
            <span className="text-primary">-{s} dBm</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BackgroundElements
