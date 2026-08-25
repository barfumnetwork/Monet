"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type NetworkSphereProps = {
  nodeCount: number;
  radius?: number;
  maxConnectionsPerNode?: number;
  connectionDistance?: number;
  accentRatio?: number;
};

// Evenly distributes `count` points on a sphere surface using the
// golden-angle (Fibonacci sphere) method — no clustering at the poles,
// no randomness needed to look "even".
function fibonacciSpherePoints(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
}

// Soft radial-gradient sprite texture, drawn once on a canvas — used for
// the glow halo and node "energy" pinpoints. No external asset, no
// postprocessing pipeline required for the bloom look.
function createGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(180,225,255,0.7)");
  gradient.addColorStop(1, "rgba(180,225,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Hologram-style network sphere: nodes as glowing THREE.Points, a
 * restrained set of connecting lines as THREE.LineSegments (all additive
 * blending for the sci-fi glow look), a pulsing energy core, and a soft
 * halo sprite that breathes gently. Everything is self-lit — no light
 * rig, no postprocessing/bloom pipeline, no external asset.
 */
export default function NetworkSphere({
  nodeCount,
  radius = 1,
  maxConnectionsPerNode = 3,
  connectionDistance = 0.55,
  accentRatio = 0.14,
}: NetworkSphereProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const nodesMatRef = useRef<THREE.PointsMaterial>(null);

  const {
    nodesGeometry,
    nodesMaterial,
    linesGeometry,
    linesMaterial,
    particlesGeometry,
    particlesMaterial,
    glowTexture,
  } = useMemo(() => {
    const nodes = fibonacciSpherePoints(nodeCount, radius);
    const glowTexture = createGlowTexture();

    // --- Nodes (points) — cool cyan-white base, warm accent highlights ---
    const nodePositions = new Float32Array(nodes.length * 3);
    const nodeColors = new Float32Array(nodes.length * 3);
    const baseColor = new THREE.Color("#bfeaff");
    const accentColor = new THREE.Color("#ff5548");
    nodes.forEach((p, i) => {
      nodePositions[i * 3] = p.x;
      nodePositions[i * 3 + 1] = p.y;
      nodePositions[i * 3 + 2] = p.z;
      const isAccent = i % Math.round(1 / accentRatio) === 0;
      const c = isAccent ? accentColor : baseColor;
      nodeColors[i * 3] = c.r;
      nodeColors[i * 3 + 1] = c.g;
      nodeColors[i * 3 + 2] = c.b;
    });
    const nodesGeometry = new THREE.BufferGeometry();
    nodesGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodesGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    const nodesMaterial = new THREE.PointsMaterial({
      size: radius * 0.06,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // --- Connections — restrained nearest-neighbour, capped per node ---
    const linePositions: number[] = [];
    const connectionCounts = new Array(nodes.length).fill(0);
    for (let i = 0; i < nodes.length; i++) {
      if (connectionCounts[i] >= maxConnectionsPerNode) continue;
      const distances: { j: number; d: number }[] = [];
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].distanceTo(nodes[j]);
        if (d <= connectionDistance) distances.push({ j, d });
      }
      distances.sort((a, b) => a.d - b.d);
      for (const { j } of distances) {
        if (connectionCounts[i] >= maxConnectionsPerNode) break;
        if (connectionCounts[j] >= maxConnectionsPerNode) continue;
        linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        connectionCounts[i]++;
        connectionCounts[j]++;
      }
    }
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const linesMaterial = new THREE.LineBasicMaterial({
      color: "#8fd6ff",
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // --- Loose particles outside the sphere — ambient sci-fi dust ---
    const particleCount = Math.round(nodeCount * 0.4);
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      const dist = radius * (1.3 + Math.random() * 1.1);
      particlePositions[i * 3] = dir.x * dist;
      particlePositions[i * 3 + 1] = dir.y * dist;
      particlePositions[i * 3 + 2] = dir.z * dist;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: radius * 0.03,
      map: glowTexture,
      color: "#bfeaff",
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return {
      nodesGeometry,
      nodesMaterial,
      linesGeometry,
      linesMaterial,
      particlesGeometry,
      particlesMaterial,
      glowTexture,
    };
  }, [nodeCount, radius, maxConnectionsPerNode, connectionDistance, accentRatio]);

  // Breathing energy pulse — slow, ambient, independent of scroll. Gives
  // the hologram a "living" atmosphere rather than a static object.
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.85 + Math.sin(t * 0.9) * 0.15;
    if (coreRef.current) {
      const s = radius * (0.42 + Math.sin(t * 0.9) * 0.05);
      coreRef.current.scale.setScalar(s);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(t * 0.9) * 0.12;
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(radius * (2.6 + Math.sin(t * 0.6) * 0.25));
      const mat = haloRef.current.material as THREE.SpriteMaterial;
      mat.opacity = 0.22 + Math.sin(t * 0.6) * 0.08;
    }
    if (nodesMatRef.current) {
      nodesMatRef.current.opacity = 0.85 + pulse * 0.15;
    }
  });

  return (
    <group>
      {/* Soft halo sprite — reads as an ambient glow/energy field around
          the hologram, breathing slowly. */}
      <sprite ref={haloRef} scale={[radius * 2.6, radius * 2.6, 1]} renderOrder={-1}>
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#ff8f7a"
        />
      </sprite>
      {/* Pulsing energy core at the centre of the sphere. */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color="#ff5548"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <lineSegments geometry={linesGeometry} material={linesMaterial} />
      <points geometry={nodesGeometry}>
        <primitive object={nodesMaterial} ref={nodesMatRef} attach="material" />
      </points>
      <points geometry={particlesGeometry} material={particlesMaterial} />
    </group>
  );
}
