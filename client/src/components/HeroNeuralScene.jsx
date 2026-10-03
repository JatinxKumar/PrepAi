import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function NeuralCluster({ pointer }) {
  const groupRef = useRef(null);
  const pointRef = useRef(null);

  const { positions, nodeVectors, connections } = useMemo(() => {
    const vectors = [];
    const array = new Float32Array(42 * 3);

    for (let i = 0; i < 42; i += 1) {
      const radius = 1.15 + Math.random() * 1.85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const vector = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.75,
        radius * Math.cos(phi)
      );

      vectors.push(vector);
      array[i * 3] = vector.x;
      array[i * 3 + 1] = vector.y;
      array[i * 3 + 2] = vector.z;
    }

    const edges = [];
    for (let i = 0; i < vectors.length; i += 1) {
      for (let j = i + 1; j < vectors.length; j += 1) {
        if (vectors[i].distanceTo(vectors[j]) < 1.45 && edges.length < 58) {
          edges.push([vectors[i].toArray(), vectors[j].toArray()]);
        }
      }
    }

    return { positions: array, nodeVectors: vectors, connections: edges };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !pointRef.current) return;

    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.current.y * 0.18, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.current.x * 0.12, 0.05);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, pointer.current.x * 0.3, 0.03);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, pointer.current.y * 0.2, 0.03);
    pointRef.current.rotation.y -= delta * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.16} floatIntensity={0.4}>
        {connections.map((connection, index) => (
          <Line
            key={index}
            points={connection}
            color={index % 2 === 0 ? '#5be7ff' : '#7b61ff'}
            transparent
            opacity={0.24}
            lineWidth={1}
          />
        ))}

        <Points ref={pointRef} positions={positions} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color="#9ddcff"
            size={0.048}
            sizeAttenuation
            depthWrite={false}
          />
        </Points>

        {nodeVectors.slice(0, 10).map((vector, index) => (
          <mesh key={index} position={vector.toArray()}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={index % 2 === 0 ? '#8a7dff' : '#5be7ff'} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

export default function HeroNeuralScene({ pointer }) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 6.7], fov: 46 }} dpr={[1, 1.6]}>
        <color attach="background" args={['#050816']} />
        <fog attach="fog" args={['#050816', 7, 14]} />
        <ambientLight intensity={0.45} />
        <pointLight position={[3, 2, 4]} intensity={14} color="#6ee7ff" />
        <pointLight position={[-3, -2, 2]} intensity={10} color="#7c4dff" />
        <NeuralCluster pointer={pointer} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.15} />
      </Canvas>
    </div>
  );
}
m = m * m;
return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1),
  dot(p2, x2), dot(p3, x3)));
  }
`;

// ─── Custom Liquid Shader Material ───
const liquidVertexShader = `
  uniform float uTime;
  uniform float uNoiseIntensity;
  uniform float uNoiseSpeed;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNoise;

  ${ simplexNoiseGLSL }

void main() {
  vNormal = normal;
  vPosition = position;

    // Add dynamic simplex noise morphing to vertices
    float noise = snoise(position * 1.8 + uTime * uNoiseSpeed);
  vNoise = noise;
    
    vec3 newPosition = position + normal * noise * uNoiseIntensity;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const liquidFragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNoise;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));

    // Fresnel glow edge mapping
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    vec3 color = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);
    vec3 finalColor = color + vec3(fresnel * 0.8) * uColorA;

  gl_FragColor = vec4(finalColor, uOpacity * (0.8 + fresnel * 0.2));
}
`;

// ─── Scene SceneController Component ───
function SceneController({ pointer }) {
  const coreMeshRef = useRef(null);
  const coreMaterialRef = useRef(null);
  const orbitGroupRef = useRef(null);
  const orbitNodeRefs = useRef([]);
  const crystalMeshRef = useRef(null);
  const crystalMaterialRef = useRef(null);
  const pointRef = useRef(null);

  // Initial parameter values inside reference, animated by GSAP ScrollTrigger
  const transformRef = useRef({
    x: 1.8,
    y: 0,
    z: 0,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 5,
    cameraFov: 45,
    
    // Core (Hero -> How it Works)
    coreScale: 1.25,
    coreOpacity: 1.0,
    coreNoiseIntensity: 0.16,
    coreNoiseSpeed: 0.35,

    // Orbit nodes (Features)
    orbitScale: 0.0,
    orbitOpacity: 0.0,
    orbitRadius: 0.2,

    // Crystal knot (Demo)
    crystalScale: 0.0,
    crystalOpacity: 0.0,
    crystalColorMix: 0.0
  });

  // Setup GSAP ScrollTrigger timeline to interpolate properties smoothly
  useEffect(() => {
    // Single timeline scrubbing the properties of transformRef across the page height
    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5 // Fluid scrubbing inertia
      }
    });

    // 1. Core stretches and morphs (Hero to How it works)
    mainTimeline.to(transformRef.current, {
      x: -1.6,
      y: -0.25,
      cameraZ: 4.8,
      coreNoiseIntensity: 0.38,
      coreNoiseSpeed: 0.8,
      coreScale: 1.05,
      duration: 1
    });

    // 2. Core fades and Orbiting nodes burst out (How it works to Features)
    mainTimeline.to(transformRef.current, {
      x: 1.7,
      y: 0.0,
      cameraZ: 5.2,
      coreScale: 0.0,
      coreOpacity: 0.0,
      orbitScale: 1.2,
      orbitOpacity: 1.0,
      orbitRadius: 1.6,
      duration: 1
    });

    // 3. Orbiting nodes contract, DNA Helix crystal knot fades in (Features to Demo)
    mainTimeline.to(transformRef.current, {
      x: 0,
      y: -0.2,
      cameraZ: 4.4,
      cameraFov: 40,
      orbitScale: 0.0,
      orbitOpacity: 0.0,
      orbitRadius: 0.2,
      crystalScale: 1.45,
      crystalOpacity: 1.0,
      duration: 1
    });

    return () => {
      mainTimeline.scrollTrigger?.kill();
      mainTimeline.kill();
    };
  }, []);

  // Subtle star dust particles in the background
  const positions = useMemo(() => {
    const array = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i += 1) {
      const radius = 1.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.75;
      array[i * 3 + 2] = radius * Math.cos(phi);
    }
    return array;
  }, []);

  // Dynamic animation frame loop updating values directly for peak performance (60 FPS)
  useFrame((state, delta) => {
    const data = transformRef.current;

    // 1. Move and scale Core Mesh
    if (coreMeshRef.current && coreMaterialRef.current) {
      coreMeshRef.current.position.x = THREE.MathUtils.lerp(coreMeshRef.current.position.x, data.x, 0.05);
      coreMeshRef.current.position.y = THREE.MathUtils.lerp(coreMeshRef.current.position.y, data.y, 0.05);
      coreMeshRef.current.position.z = THREE.MathUtils.lerp(coreMeshRef.current.position.z, data.z, 0.05);
      
      const currentScale = THREE.MathUtils.lerp(coreMeshRef.current.scale.x, data.coreScale, 0.05);
      coreMeshRef.current.scale.setScalar(currentScale);

      coreMeshRef.current.rotation.x += delta * 0.15;
      coreMeshRef.current.rotation.y += delta * 0.1;

      // Update shader uniforms directly
      coreMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      coreMaterialRef.current.uniforms.uNoiseIntensity.value = THREE.MathUtils.lerp(
        coreMaterialRef.current.uniforms.uNoiseIntensity.value,
        data.coreNoiseIntensity,
        0.05
      );
      coreMaterialRef.current.uniforms.uNoiseSpeed.value = THREE.MathUtils.lerp(
        coreMaterialRef.current.uniforms.uNoiseSpeed.value,
        data.coreNoiseSpeed,
        0.05
      );
      coreMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        coreMaterialRef.current.uniforms.uOpacity.value,
        data.coreOpacity,
        0.05
      );
    }

    // 2. Animate Orbiting Nodes Group
    if (orbitGroupRef.current) {
      orbitGroupRef.current.position.x = THREE.MathUtils.lerp(orbitGroupRef.current.position.x, data.x, 0.05);
      orbitGroupRef.current.position.y = THREE.MathUtils.lerp(orbitGroupRef.current.position.y, data.y, 0.05);
      orbitGroupRef.current.position.z = THREE.MathUtils.lerp(orbitGroupRef.current.position.z, data.z, 0.05);

      const scale = THREE.MathUtils.lerp(orbitGroupRef.current.scale.x, data.orbitScale, 0.05);
      orbitGroupRef.current.scale.setScalar(scale);

      // Rotate group orbits
      orbitGroupRef.current.rotation.y += delta * 0.6;
      orbitGroupRef.current.rotation.x += delta * 0.2;

      // Orbit radius distance expansion
      const radius = THREE.MathUtils.lerp(data.orbitRadius, data.orbitRadius, 0.05);
      orbitNodeRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const angle = (index / 3) * Math.PI * 2;
        ref.position.x = Math.cos(angle) * radius;
        ref.position.z = Math.sin(angle) * radius;
        ref.position.y = Math.sin(angle * 2.2) * 0.45;
        ref.rotation.y += delta * 0.8;
      });
    }

    // 3. Move and scale Crystalline DNA Torus Knot
    if (crystalMeshRef.current) {
      crystalMeshRef.current.position.x = THREE.MathUtils.lerp(crystalMeshRef.current.position.x, data.x, 0.05);
      crystalMeshRef.current.position.y = THREE.MathUtils.lerp(crystalMeshRef.current.position.y, data.y, 0.05);
      crystalMeshRef.current.position.z = THREE.MathUtils.lerp(crystalMeshRef.current.position.z, data.z, 0.05);

      const currentScale = THREE.MathUtils.lerp(crystalMeshRef.current.scale.x, data.crystalScale, 0.05);
      crystalMeshRef.current.scale.setScalar(currentScale);

      // Elegant crystalline slow rotation
      crystalMeshRef.current.rotation.x += delta * 0.08;
      crystalMeshRef.current.rotation.y += delta * 0.12;
    }

    // 4. Background stars animation
    if (pointRef.current) {
      pointRef.current.rotation.y += delta * 0.015;
    }

    // 5. Cinematic Camera Track & Parallax
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, data.cameraX + pointer.current.x * 0.5, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, data.cameraY + pointer.current.y * 0.5, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, data.cameraZ, 0.05);
    
    if (Math.abs(state.camera.fov - data.cameraFov) > 0.01) {
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, data.cameraFov, 0.05);
      state.camera.updateProjectionMatrix();
    }

    // Camera continuously looks at the active center coordinate
    state.camera.lookAt(
      THREE.MathUtils.lerp(state.camera.position.x - pointer.current.x * 0.5, data.x, 0.05),
      THREE.MathUtils.lerp(state.camera.position.y - pointer.current.y * 0.5, data.y, 0.05),
      THREE.MathUtils.lerp(state.camera.position.z - data.cameraZ, data.z, 0.05)
    );
  });

  // Custom shader uniforms
  const coreUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uNoiseIntensity: { value: 0.16 },
    uNoiseSpeed: { value: 0.35 },
    uColorA: { value: new THREE.Color('#22d3ee') }, // Glowing cyan
    uColorB: { value: new THREE.Color('#8b5cf6') }, // Vibrant violet
    uOpacity: { value: 1.0 }
  }), []);

  return (
    <>
      {/* Mesh A: Iridescent Liquid AI Core */}
      <mesh ref={coreMeshRef}>
        <icosahedronGeometry args={[1.05, 54]} />
        <shaderMaterial
          ref={coreMaterialRef}
          vertexShader={liquidVertexShader}
          fragmentShader={liquidFragmentShader}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Mesh B: Orbiting Nodes Group */}
      <group ref={orbitGroupRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} ref={(el) => (orbitNodeRefs.current[i] = el)}>
            <icosahedronGeometry args={[0.26, 12]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={0.65}
              roughness={0.1}
              metalness={0.1}
              transparent
              opacity={transformRef.current.orbitOpacity}
            />
          </mesh>
        ))}
      </group>

      {/* Mesh C: Glass DNA Helix Torus Knot */}
      <mesh ref={crystalMeshRef}>
        <torusKnotGeometry args={[0.62, 0.19, 130, 16, 2, 3]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.12}
          anisotropy={0.1}
          distortion={0.2}
          clearcoat={1.0}
          attenuationDistance={0.5}
          attenuationColor="#22d3ee"
          color="#8b5cf6"
          transparent
        />
      </mesh>

      {/* Volumetric background dust particles */}
      <Points ref={pointRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.038}
          sizeAttenuation
          depthWrite={false}
          opacity={0.16}
        />
      </Points>
    </>
  );
}

// ─── Main HeroNeuralScene WebGL Canvas ───
export default function HeroNeuralScene({ pointer }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 4, 3]} intensity={18} color="#22d3ee" />
        <pointLight position={[-3, -4, 2]} intensity={14} color="#8b5cf6" />
        
        {/* Central soft volumetric glow */}
        <pointLight position={[0, 0, 0]} intensity={12} color="#22d3ee" />

        <SceneController pointer={pointer} />
      </Canvas>
    </div>
  );
}
