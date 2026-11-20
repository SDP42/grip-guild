"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import GLFallback, { useWebGL } from "./GLFallback";
import { ContactShadows, Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { heroScroll } from "@/lib/scroll";
import { Tyre } from "./Tyre";

function Rig() {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((state, dt) => {
    const p = heroScroll.progress; // 0 → 1 across the pinned hero
    const g = group.current;
    if (!g) return;
    spin.current += dt * (0.35 + p * 5); // tyre spins up as you scroll
    g.rotation.z = -spin.current;

    // Phase 1 (0–0.45): tyre turns to face the camera. Phase 2: dive through the hub.
    const face = THREE.MathUtils.smoothstep(p, 0, 0.45);
    const dive = THREE.MathUtils.smoothstep(p, 0.45, 1);
    const tiltY = THREE.MathUtils.lerp(-0.85, 0, face) + heroScroll.pointerX * 0.25;
    const tiltX = THREE.MathUtils.lerp(0.18, 0, face) - heroScroll.pointerY * 0.15;
    g.parent!.rotation.y = THREE.MathUtils.damp(g.parent!.rotation.y, tiltY, 4, dt);
    g.parent!.rotation.x = THREE.MathUtils.damp(g.parent!.rotation.x, tiltX, 4, dt);
    // Phones: tyre sits centred in the upper half so the headline below stays readable.
    const narrow = state.size.width < 640;
    const tx = narrow ? 0 : THREE.MathUtils.lerp(1.75, 0, face);
    const ty = narrow ? THREE.MathUtils.lerp(1.12, 0, face) : 0;
    const ts = narrow ? THREE.MathUtils.lerp(0.5, 0.82, face) : 0.82;
    g.parent!.position.x = THREE.MathUtils.damp(g.parent!.position.x, tx, 4, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 4, dt); // on the group itself: Float drives its parent's y
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, ts, 4, dt));

    state.camera.position.z = THREE.MathUtils.lerp(6.2, 0.35, dive * dive);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.4}>
        <group ref={group} scale={0.82}>
          <Tyre />
        </group>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  const gl = useWebGL();
  if (gl === false) return <GLFallback />;
  if (gl === null) return null;
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 38 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      shadows
    >
      <color attach="background" args={["#07080A"]} />
      <fog attach="fog" args={["#07080A", 9, 16]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 3, -4]} intensity={6} color="#ffd9c2" />
      <spotLight position={[4, 6, 5]} angle={0.35} penumbra={1} intensity={140} castShadow color="#fff3e6" />
      <pointLight position={[-4, -1, 2]} intensity={25} color="#FF5A1F" />
      <pointLight position={[3, -3, -2]} intensity={12} color="#38BDF8" />
      <Rig />
      <Sparkles count={70} scale={[9, 5, 4]} size={2.2} speed={0.35} color="#FFB020" opacity={0.55} />
      <ContactShadows position={[0, -2.05, 0]} opacity={0.55} scale={10} blur={2.6} far={4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -6]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#FF5A1F" position={[-6, 0, 2]} scale={[2, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="ring" intensity={2.5} color="#ffffff" position={[5, 2, 3]} scale={2} />
      </Environment>
    </Canvas>
  );
}
