"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type EnergyAuraProps = {
  radius?: number;
  streamCount: number;
  ringCount?: number;
  glowTexture: THREE.Texture;
};

/**
 * Outward-flowing energy layer that sits around the network sphere.
 *
 * Two parts, both additive and self-lit:
 *  1. Energy streams — particles that continuously flow from just above
 *     the sphere surface outward, fade as they travel, then respawn.
 *     This is what reads as "aura flowing out" rather than a static halo.
 *  2. Aura rings — thin, slowly counter-rotating tori tilted off-axis,
 *     giving the hologram an orbital/containment-field character.
 *
 * Deliberately kept separate from NetworkSphere so the node/line
 * structure stays untouched: this component only ADDS layers around it.
 */
export default function EnergyAura({
  radius = 1,
  streamCount,
  ringCount = 3,
  glowTexture,
}: EnergyAuraProps) {
  const streamsRef = useRef<THREE.Points>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  // Per-particle flow state kept outside the geometry so the animation
  // loop only writes into a single Float32Array (cheap, no allocation).
  const { geometry, material, directions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(streamCount * 3);
    const colors = new Float32Array(streamCount * 3);
    const directions: THREE.Vector3[] = [];
    const speeds = new Float32Array(streamCount);
    const offsets = new Float32Array(streamCount);

    const cool = new THREE.Color("#9fdcff");
    const warm = new THREE.Color("#ff6a52");

    for (let i = 0; i < streamCount; i++) {
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();
      directions.push(dir);
      speeds[i] = 0.08 + Math.random() * 0.16;
      // Stagger start positions so the stream looks continuous from the
      // very first frame instead of pulsing as one synchronized burst.
      offsets[i] = Math.random();

      const c = Math.random() < 0.25 ? warm : cool;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      const d = radius * (1 + offsets[i] * 0.9);
      positions[i * 3] = dir.x * d;
      positions[i * 3 + 1] = dir.y * d;
      positions[i * 3 + 2] = dir.z * d;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: radius * 0.045,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry, material, directions, speeds, offsets };
  }, [streamCount, radius, glowTexture]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // --- Energy streams flowing outward ---
    const pts = streamsRef.current;
    if (pts) {
      const posAttr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < directions.length; i++) {
        offsets[i] += speeds[i] * delta;
        if (offsets[i] > 1) offsets[i] -= 1; // respawn at the surface
        const d = radius * (1 + offsets[i] * 0.95);
        const dir = directions[i];
        // Slight swirl on the way out so the flow curves instead of
        // travelling in dead-straight radial lines.
        const swirl = offsets[i] * 0.6;
        const cos = Math.cos(swirl);
        const sin = Math.sin(swirl);
        arr[i * 3] = (dir.x * cos - dir.z * sin) * d;
        arr[i * 3 + 1] = dir.y * d;
        arr[i * 3 + 2] = (dir.x * sin + dir.z * cos) * d;
      }
      posAttr.needsUpdate = true;

      // Particles fade as they get further out — done on the material
      // as a whole plus a gentle global pulse (cheap approximation of
      // per-particle alpha without a custom shader).
      const mat = pts.material as THREE.PointsMaterial;
      mat.opacity = 0.42 + Math.sin(t * 1.1) * 0.12;
    }

    // --- Counter-rotating aura rings ---
    const rings = ringGroupRef.current;
    if (rings) {
      rings.children.forEach((ring, i) => {
        const dirSign = i % 2 === 0 ? 1 : -1;
        ring.rotation.z += delta * 0.12 * dirSign;
        ring.rotation.y += delta * 0.07 * dirSign;
        const mat = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = 0.1 + Math.abs(Math.sin(t * 0.5 + i)) * 0.1;
      });
    }
  });

  return (
    <group>
      <points ref={streamsRef} geometry={geometry} material={material} />
      <group ref={ringGroupRef}>
        {Array.from({ length: ringCount }).map((_, i) => (
          <mesh
            key={i}
            rotation={[Math.PI / 2 + i * 0.5, i * 0.7, i * 0.35]}
            scale={1 + i * 0.22}
          >
            <torusGeometry args={[radius * 1.35, radius * 0.006, 8, 96]} />
            <meshBasicMaterial
              color={i === 1 ? "#ff6a52" : "#9fdcff"}
              transparent
              opacity={0.14}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
