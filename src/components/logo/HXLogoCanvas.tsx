"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { HXMark3D } from "@/components/logo/HXMark3D";

/**
 * The hero mark. The environment is built from in-scene lightformers rather
 * than a downloaded HDRI, so the metal reads correctly with no network fetch.
 */
export default function HXLogoCanvas({
  reducedMotion = false,
  scale = 1,
}: {
  reducedMotion?: boolean;
  scale?: number;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.4], fov: 32 }}
      frameloop={reducedMotion ? "demand" : "always"}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, -4]} intensity={0.5} color="#3df2a7" />

      <HXMark3D interactive={!reducedMotion} spin={!reducedMotion} scale={scale} />

      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#05070a"]} />
        <Lightformer form="rect" intensity={3.2} position={[0, 5, 2]} scale={[10, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.8} color="#3df2a7" position={[-6, 1, 2]} scale={[5, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#7f9dff" position={[6, -2, 3]} scale={[5, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2.4} position={[2, 3, -4]} scale={4} target={[0, 0, 0]} />
      </Environment>
    </Canvas>
  );
}
