import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const XanthanMaterial = ({ color }: { color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
      materialRef.current.uniforms.uColor.value.set(color)
      materialRef.current.uniforms.uMouse.value.set(state.mouse.x, state.mouse.y)
    }
  })

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    uniform float uTime;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDirection = normalize(-modelViewPosition.xyz);
      
      // Dynamic vertex wave based on time
      vec3 newPosition = position + normal * sin(position.y * 10.0 + uTime * 2.0) * 0.05;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec3 uColor;

    void main() {
      // Fresnel Effect: glow at edges
      float fresnel = pow(1.0 - dot(vViewDirection, vNormal), 3.0);
      
      // Moving energy patterns
      float pattern = sin(vPosition.x * 5.0 + uTime) * cos(vPosition.y * 5.0 + uTime);
      
      vec3 finalColor = mix(uColor * 0.1, uColor, fresnel + pattern * 0.2);
      
      // Iridescent edge effect
      vec3 rainbow = 0.5 + 0.5 * cos(uTime + vUv.xyx + vec3(0, 2, 4));
      finalColor += rainbow * fresnel * 0.8;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
    />
  )
}

export default XanthanMaterial
