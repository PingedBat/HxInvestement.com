"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";

const DIAGONAL = 0.7; // radians from vertical — sets how wide the X spans

export function HXMark3D({
  interactive = true,
  spin = true,
  scale = 1,
}: {
  interactive?: boolean;
  spin?: boolean;
  scale?: number;
}) {
  const group = useRef<Group>(null);
  const spinRef = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    if (spin) spinRef.current += delta * 0.18;

    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;

    const targetY = spinRef.current + px * 0.45;
    const targetX = -py * 0.3;

    // Ease toward the target rather than snapping, so the cursor reads as a
    // nudge rather than a direct handle on the mark.
    g.rotation.y += (targetY - g.rotation.y) * Math.min(1, delta * 3.4);
    g.rotation.x += (targetX - g.rotation.x) * Math.min(1, delta * 3.4);
  });

  return (
    <group ref={group} scale={scale} rotation={[0.12, -0.5, 0]}>
      {/* H uprights */}
      {[-1.06, 1.06].map((x) => (
        <RoundedBox key={x} args={[0.42, 2.74, 0.48]} radius={0.07} smoothness={4} position={[x, 0, 0]}>
          <meshPhysicalMaterial
            color="#aab4c6"
            metalness={1}
            roughness={0.19}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
            envMapIntensity={1.35}
          />
        </RoundedBox>
      ))}

      {/* X crossing pair, offset in depth so the two strokes genuinely weave */}
      {[
        { rot: DIAGONAL, z: 0.17 },
        { rot: -DIAGONAL, z: -0.17 },
      ].map(({ rot, z }) => (
        <RoundedBox
          key={rot}
          args={[0.36, 3.02, 0.4]}
          radius={0.06}
          smoothness={4}
          position={[0, 0, z]}
          rotation={[0, 0, rot]}
        >
          <meshPhysicalMaterial
            color="#3df2a7"
            metalness={0.92}
            roughness={0.13}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.6}
          />
        </RoundedBox>
      ))}
    </group>
  );
}
