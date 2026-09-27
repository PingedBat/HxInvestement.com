"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import type { Group, Mesh } from "three";

export type Layout = "market" | "bought" | "held" | "traded" | "settled";

const COUNT = 6;

/** Target position, scale and tint for one share block in a given layout. */
function targetFor(i: number, layout: Layout): { pos: [number, number, number]; scale: number } {
  const col = i % 3;
  const row = Math.floor(i / 3);

  switch (layout) {
    case "market":
      return { pos: [-2.6 + i * 1.04, 1.15, 0], scale: 0.72 };
    case "bought":
      return { pos: [-1.55 + col * 0.52, -0.55 + row * 0.52, 0], scale: 1 };
    case "held":
      return { pos: [-0.9 + col * 0.9, -0.45 + row * 0.9, 0], scale: 1 };
    case "traded":
      return {
        pos: [i % 2 === 0 ? -1.75 : 1.75, -0.5 + row * 0.55 + (i % 2) * 0.28, i % 2 === 0 ? 0.2 : -0.2],
        scale: 0.94,
      };
    case "settled":
      return { pos: [1.35 + col * 0.44, -0.5 + row * 0.44, 0], scale: 0.62 };
  }
}

function Shares({ layout, accent }: { layout: Layout; accent: string }) {
  const refs = useRef<(Mesh | null)[]>([]);

  useFrame((state, delta) => {
    const k = Math.min(1, delta * 2.6);
    const t = state.clock.elapsedTime;

    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const { pos, scale } = targetFor(i, layout);
      // Held shares breathe gently so "holding" does not read as frozen.
      const bob = layout === "held" ? Math.sin(t * 0.9 + i * 0.7) * 0.07 : 0;

      mesh.position.x += (pos[0] - mesh.position.x) * k;
      mesh.position.y += (pos[1] + bob - mesh.position.y) * k;
      mesh.position.z += (pos[2] - mesh.position.z) * k;

      const s = mesh.scale.x + (scale - mesh.scale.x) * k;
      mesh.scale.setScalar(s);

      mesh.rotation.y += delta * (layout === "traded" ? 0.55 : 0.16);
    });
  });

  return (
    <group>
      {Array.from({ length: COUNT }, (_, i) => (
        <RoundedBox
          key={i}
          ref={(el: Mesh | null) => {
            refs.current[i] = el;
          }}
          args={[0.46, 0.46, 0.46]}
          radius={0.07}
          smoothness={4}
          position={[-2.6 + i * 1.04, 1.15, 0]}
        >
          <meshPhysicalMaterial
            color={i % 2 === 0 ? accent : "#aab4c6"}
            metalness={0.94}
            roughness={0.16}
            clearcoat={0.8}
            envMapIntensity={1.4}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

/** Vertical bar whose height tracks the value being described. */
function ValueBar({ ratio, accent }: { ratio: number; accent: string }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const target = Math.max(0.12, ratio);
    g.scale.y += (target - g.scale.y) * Math.min(1, delta * 2.4);
    g.position.y = -1.35 + g.scale.y * 0.9;
  });

  return (
    <group position={[3.15, -1.35, 0]}>
      <mesh position={[0, 0.9, -0.05]}>
        <boxGeometry args={[0.2, 1.8, 0.2]} />
        <meshStandardMaterial color="#161a24" roughness={0.9} />
      </mesh>
      <group ref={group} scale={[1, 0.12, 1]}>
        <mesh>
          <boxGeometry args={[0.26, 1.8, 0.26]} />
          <meshPhysicalMaterial color={accent} metalness={0.9} roughness={0.18} envMapIntensity={1.6} />
        </mesh>
      </group>
    </group>
  );
}

export default function ExplainerScene({
  layout,
  accent,
  valueRatio,
}: {
  layout: Layout;
  accent: string;
  valueRatio: number;
}) {
  const key = useMemo(() => `${accent}`, [accent]);

  return (
    <Canvas
      key={key}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.4, 8.2], fov: 32 }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, -2, -4]} intensity={0.45} color={accent} />

      <Shares layout={layout} accent={accent} />
      <ValueBar ratio={valueRatio} accent={accent} />

      <Environment resolution={192} frames={1}>
        <color attach="background" args={["#05070a"]} />
        <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color={accent} position={[-6, 1, 2]} scale={[5, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#7f9dff" position={[6, -2, 3]} scale={[5, 8, 1]} target={[0, 0, 0]} />
      </Environment>
    </Canvas>
  );
}
