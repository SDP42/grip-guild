"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Tyre Twin — a layered, explodable digital twin of a two-wheeler tyre.
 * Tread blocks are coloured by a wear heatmap derived from TreadLens data.
 */

import type { WearPattern } from "./twinLayers";

export type { WearPattern };

const R_OUT = 1.55;
const R_IN = 1.02;
const WIDTH = 0.62;
const SEGMENTS = 64;
const ROWS = [-0.2, 0, 0.2]; // axial positions of tread rows

const GREEN = new THREE.Color("#C6FF3D");
const AMBER = new THREE.Color("#FFB020");
const RED = new THREE.Color("#F43F5E");
const RUBBER = new THREE.Color("#1b1c20");

function wearAt(row: number, k: number, base: number, pattern: WearPattern) {
  const side = ROWS[row];
  let w = base;
  if (pattern === "center") w += row === 1 ? 0.35 : -0.1;
  if (pattern === "edges") w += row === 1 ? -0.15 : 0.35;
  if (pattern === "one_side") w += side < 0 ? 0.4 : side > 0 ? -0.15 : 0.1;
  if (pattern === "cupping") w += Math.sin((k / SEGMENTS) * Math.PI * 12) * 0.3;
  w += Math.sin(k * 1.7 + row) * 0.04;
  return THREE.MathUtils.clamp(w, 0, 1);
}

function heat(w: number, out: THREE.Color) {
  return w < 0.5 ? out.copy(GREEN).lerp(AMBER, w / 0.5) : out.copy(AMBER).lerp(RED, (w - 0.5) / 0.5);
}

function profile(rOut: number, rIn: number, width: number) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI;
    pts.push(new THREE.Vector2(rIn + (rOut - rIn) * Math.pow(Math.sin(t), 0.55), -Math.cos(t) * (width / 2)));
  }
  return pts;
}

function TwinModel({ wear, pattern, exploded, heatmap, spin }: { wear: number; pattern: WearPattern; exploded: number; heatmap: boolean; spin: boolean }) {
  const tread = useRef<THREE.InstancedMesh>(null);
  const root = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Object3D | null)[]>([]);
  const e = useRef(exploded);

  const carcassGeo = useMemo(() => {
    const g = new THREE.LatheGeometry(profile(R_OUT - 0.04, R_IN, WIDTH), 128);
    g.rotateX(Math.PI / 2);
    g.computeVertexNormals();
    return g;
  }, []);
  const blockGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.07, 0.17), []);

  useLayoutEffect(() => {
    const mesh = tread.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let i = 0;
    for (let k = 0; k < SEGMENTS; k++) {
      const a = (k / SEGMENTS) * Math.PI * 2 + (k % 2) * 0.02;
      ROWS.forEach((z, row) => {
        const w = wearAt(row, k, wear, pattern);
        const r = R_OUT - 0.02 * (1 - Math.abs(z) * 2) + 0.01;
        o.position.set(Math.cos(a) * r, Math.sin(a) * r, z);
        o.rotation.set(0, 0, a + Math.PI / 2);
        o.rotateY(row === 1 ? 0 : (z > 0 ? 1 : -1) * 0.5);
        o.scale.set(1, 1 - w * 0.75, 1); // worn blocks are physically shallower
        o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix);
        mesh.setColorAt(i, heatmap ? heat(w, c) : c.copy(RUBBER));
        i++;
      });
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [wear, pattern, heatmap]);

  useFrame((_, dt) => {
    e.current = THREE.MathUtils.damp(e.current, exploded, 5, dt);
    // Each layer slides out along the axle by a different amount.
    const offsets = [1.6, 0.95, 0.35, -0.45, -1.15]; // tread, belt, carcass, bead, rim
    layers.current.forEach((l, idx) => { if (l) l.position.z = offsets[idx] * e.current; });
    if (root.current && spin) root.current.rotation.z -= dt * 0.25;
  });

  const set = (i: number) => (el: THREE.Object3D | null) => { layers.current[i] = el; };

  return (
    <group rotation={[0.22, -1.08, 0]}>
      <group ref={root}>
        <group ref={set(0)}>
          <instancedMesh ref={tread} args={[blockGeo, undefined, SEGMENTS * ROWS.length]} castShadow>
            <meshStandardMaterial roughness={0.75} vertexColors={false} />
          </instancedMesh>
        </group>
        <group ref={set(1)}>
          <mesh>
            <torusGeometry args={[R_OUT - 0.07, 0.035, 12, 160]} />
            <meshStandardMaterial color="#C9A66B" metalness={0.9} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <torusGeometry args={[R_OUT - 0.08, 0.02, 8, 160]} />
            <meshStandardMaterial color="#C9A66B" metalness={0.9} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, -0.12]}>
            <torusGeometry args={[R_OUT - 0.08, 0.02, 8, 160]} />
            <meshStandardMaterial color="#C9A66B" metalness={0.9} roughness={0.35} />
          </mesh>
        </group>
        <group ref={set(2)}>
          <mesh geometry={carcassGeo}>
            <meshStandardMaterial color="#25272c" roughness={0.7} side={THREE.DoubleSide} transparent opacity={heatmap ? 0.55 : 1} />
          </mesh>
          <mesh position={[0, 0, WIDTH / 2 - 0.03]}>
            <torusGeometry args={[R_IN + 0.22, 0.012, 8, 160]} />
            <meshStandardMaterial color="#FF5A1F" emissive="#FF5A1F" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
        <group ref={set(3)}>
          {[-0.2, 0.2].map((z) => (
            <mesh key={z} position={[0, 0, z]}>
              <torusGeometry args={[R_IN + 0.01, 0.028, 10, 128]} />
              <meshStandardMaterial color="#9aa0a8" metalness={1} roughness={0.25} />
            </mesh>
          ))}
        </group>
        <group ref={set(4)}>
          <mesh>
            <torusGeometry args={[R_IN - 0.03, 0.05, 16, 128]} />
            <meshStandardMaterial color="#d0d3d8" metalness={1} roughness={0.2} />
          </mesh>
          {Array.from({ length: 5 }).map((_, i) => (
            <group key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
              <mesh position={[0.52, 0, 0]} rotation={[0, 0, 0.18]}>
                <boxGeometry args={[0.9, 0.085, 0.07]} />
                <meshStandardMaterial color="#d6d9de" metalness={1} roughness={0.18} />
              </mesh>
            </group>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.3, 40]} />
            <meshStandardMaterial color="#1b1d21" metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      </group>

    </group>
  );
}

export default function TyreTwin({ wear = 0.45, pattern = "edges", exploded = 0, heatmap = true, spin = true, controls = true }:
  { wear?: number; pattern?: WearPattern; exploded?: number; heatmap?: boolean; spin?: boolean; controls?: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.6, 7.2], fov: 40 }} shadows>
      <ambientLight intensity={0.45} />
      <spotLight position={[5, 6, 6]} angle={0.4} penumbra={1} intensity={120} castShadow />
      <pointLight position={[-5, -1, 3]} intensity={30} color="#FF5A1F" />
      <pointLight position={[4, -3, -3]} intensity={18} color="#38BDF8" />
      <TwinModel wear={wear} pattern={pattern} exploded={exploded} heatmap={heatmap} spin={spin} />
      <ContactShadows position={[0, -2.3, 0]} opacity={0.5} scale={12} blur={2.8} far={4} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -5]} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={2} position={[5, 2, 4]} scale={2} />
      </Environment>
      {controls && <OrbitControls enablePan={false} minDistance={4} maxDistance={11} enableDamping />}
    </Canvas>
  );
}

