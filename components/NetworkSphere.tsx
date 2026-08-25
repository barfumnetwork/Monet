"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import EnergyAura from "./EnergyAura";
import { useRipples } from "@/lib/useRipples";

type NetworkSphereProps = {
  nodeCount: number;
  radius?: number;
  maxConnectionsPerNode?: number;
  connectionDistance?: number;
  accentRatio?: number;
  streamCount?: number;
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
// the glow halo, node pinpoints and energy streams. No external asset,
// no postprocessing pipeline required for the bloom look.
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

const RIPPLE_LIFETIME = 2.2;

/**
 * Hologram-style network sphere: glowing nodes (THREE.Points), a
 * restrained set of connecting lines (THREE.LineSegments), a pulsing
 * energy core, a breathing halo, and — layered around it — the
 * outward-flowing EnergyAura.
 *
 * Nodes additionally respond to touch/click like the surface of water:
 * each active ripple pushes nearby nodes outward along their own radial
 * direction, with the displacement travelling out as an expanding ring
 * and decaying over time. The base geometry is never mutated — every
 * frame recomputes displacement from the untouched original positions,
 * so the structure always settles back exactly as it was.
 */
export default function NetworkSphere({
  nodeCount,
  radius = 1,
  maxConnectionsPerNode = 3,
  connectionDistance = 0.55,
  accentRatio = 0.14,
  streamCount = 90,
}: NetworkSphereProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const { tick } = useRipples();

  const {
    nodesGeometry,
    nodesMaterial,
    linesGeometry,
    linesMaterial,
    particlesGeometry,
    particlesMaterial,
    glowTexture,
    basePositions,
  } = useMemo(() => {
    const nodes = fibonacciSpherePoints(nodeCount, radius);
    const glowTexture = createGlowTexture();

    // --- Nodes — cool cyan-white base, warm accent highlights ---
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
    // Pristine copy — ripple displacement is always computed from this,
    // never accumulated onto the live buffer.
    const basePositions = new Float32Array(nodePositions);

    const nodesGeometry = new THREE.BufferGeometry();
    nodesGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodesGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    const nodesMaterial = new THREE.PointsMaterial({
      size: radius * 0.075,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 1,
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
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // --- Loose ambient particles outside the sphere ---
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
      size: radius * 0.038,
      map: glowTexture,
      color: "#bfeaff",
      transparent: true,
      opacity: 0.6,
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
      basePositions,
    };
  }, [nodeCount, radius, maxConnectionsPerNode, connectionDistance, accentRatio]);

  // Scratch vectors reused every frame — no per-frame allocation.
  const scratch = useMemo(() => ({ world: new THREE.Vector3(), proj: new THREE.Vector3() }), []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const ripples = tick(delta);

    // --- Ambient breathing (independent of scroll and touch) ---
    if (coreRef.current) {
      coreRef.current.scale.setScalar(radius * (0.42 + Math.sin(t * 0.9) * 0.05));
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(t * 0.9) * 0.15;
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(radius * (2.6 + Math.sin(t * 0.6) * 0.25));
      const mat = haloRef.current.material as THREE.SpriteMaterial;
      mat.opacity = 0.38 + Math.sin(t * 0.6) * 0.12;
    }

    // --- Water-touch: displace nodes near each active ripple ---
    const pts = nodesRef.current;
    if (!pts) return;
    const posAttr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const count = arr.length / 3;

    if (ripples.length === 0) {
      // Nothing touching: make sure we're exactly at rest, then skip the
      // per-node work entirely on subsequent idle frames.
      let dirty = false;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== basePositions[i]) {
          arr[i] = basePositions[i];
          dirty = true;
        }
      }
      if (dirty) posAttr.needsUpdate = true;
      return;
    }

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      // Where this node currently sits on screen, so a touch at a given
      // screen point affects the nodes visually under the finger.
      scratch.world.set(bx, by, bz);
      pts.localToWorld(scratch.world);
      scratch.proj.copy(scratch.world).project(camera);

      let displacement = 0;
      for (const r of ripples) {
        const dx = scratch.proj.x - r.x;
        const dy = scratch.proj.y - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Expanding ring: the crest travels outward from the touch point
        // and the whole thing decays over the ripple's lifetime.
        const progress = r.age / RIPPLE_LIFETIME;
        const ringRadius = progress * 1.1;
        const bandDist = Math.abs(dist - ringRadius);
        const band = Math.max(0, 1 - bandDist / 0.28);
        const decay = 1 - progress;
        displacement += Math.sin(band * Math.PI) * band * decay * r.strength * 0.22;
      }

      // Push along the node's own radial direction — the sphere stays a
      // sphere, it just ripples in and out like a water surface.
      const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
      const f = 1 + displacement / len;
      arr[i * 3] = bx * f;
      arr[i * 3 + 1] = by * f;
      arr[i * 3 + 2] = bz * f;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* Soft halo — ambient energy field, breathing slowly. */}
      <sprite ref={haloRef} scale={[radius * 2.6, radius * 2.6, 1]} renderOrder={-1}>
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#ff8f7a"
        />
      </sprite>
      {/* Pulsing energy core. */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color="#ff5548"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <lineSegments geometry={linesGeometry} material={linesMaterial} />
      <points ref={nodesRef} geometry={nodesGeometry} material={nodesMaterial} />
      <points geometry={particlesGeometry} material={particlesMaterial} />
      {/* Outward-flowing aura layered around the structure. */}
      <EnergyAura radius={radius} streamCount={streamCount} glowTexture={glowTexture} />
    </group>
  );
}
