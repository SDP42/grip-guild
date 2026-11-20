"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural two-wheeler tyre: lathe-turned carcass, instanced chevron tread
 * blocks, five-spoke alloy rim and a molten accent stripe. No external assets.
 */
const R_OUT = 1.55; // outer radius
const R_IN = 1.02; // bead / rim radius
const WIDTH = 0.62;
const BLOCKS = 56;

function carcassProfile() {
  // Cross-section (x = radius, y = axial) of a rounded motorcycle tyre.
  const pts: THREE.Vector2[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI; // 0..π across the crown
    const y = -Math.cos(t) * (WIDTH / 2);
    const bulge = Math.pow(Math.sin(t), 0.55);
    const x = R_IN + (R_OUT - R_IN) * bulge;
    pts.push(new THREE.Vector2(x, y));
  }
  return pts;
}

export function Tyre({ accent = "#FF5A1F" }: { accent?: string }) {
  const tread = useRef<THREE.InstancedMesh>(null);
  const carcass = useMemo(() => {
    const g = new THREE.LatheGeometry(carcassProfile(), 128);
    g.rotateX(Math.PI / 2); // axle along Z
    g.computeVertexNormals();
    return g;
  }, []);

  const blockGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.16, 0.05, 0.3, 1, 1, 1);
    return g;
  }, []);

  useLayoutEffect(() => {
    const mesh = tread.current;
    if (!mesh) return;
    const m = new THREE.Object3D();
    let i = 0;
    for (let k = 0; k < BLOCKS; k++) {
      const a = (k / BLOCKS) * Math.PI * 2;
      for (const side of [-1, 1]) {
        const r = R_OUT + 0.012;
        m.position.set(Math.cos(a) * r, Math.sin(a) * r, side * 0.13);
        m.rotation.set(0, 0, a + Math.PI / 2);
        m.rotateY(side * 0.55); // chevron
        m.updateMatrix();
        mesh.setMatrixAt(i++, m.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* Carcass */}
      <mesh geometry={carcass} castShadow receiveShadow>
        <meshStandardMaterial color="#141518" roughness={0.88} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Tread blocks */}
      <instancedMesh ref={tread} args={[blockGeo, undefined, BLOCKS * 2]} castShadow>
        <meshStandardMaterial color="#0e0f11" roughness={0.95} />
      </instancedMesh>

      {/* Sidewall accent stripes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * (WIDTH / 2 - 0.035)]}>
          <torusGeometry args={[R_IN + 0.2, 0.012, 8, 160]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}

      {/* Rim */}
      <mesh>
        <torusGeometry args={[R_IN - 0.02, 0.05, 16, 128]} />
        <meshStandardMaterial color="#c9ccd2" metalness={1} roughness={0.22} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R_IN - 0.04, R_IN - 0.04, 0.28, 96, 1, true]} />
        <meshStandardMaterial color="#9ea3ab" metalness={1} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Spokes */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, 0, a]}>
            <mesh position={[0.55, 0, 0]} rotation={[0, 0, 0.18]}>
              <boxGeometry args={[0.92, 0.09, 0.07]} />
              <meshStandardMaterial color="#d6d9de" metalness={1} roughness={0.18} />
            </mesh>
          </group>
        );
      })}

      {/* Hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 48]} />
        <meshStandardMaterial color="#1b1d21" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <circleGeometry args={[0.12, 48]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </group>
  );
}
