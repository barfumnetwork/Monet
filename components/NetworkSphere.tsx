"use client";

import { useMemo } from "react";
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

/**
 * Pure geometry/material construction for the network sphere: nodes as
 * THREE.Points, a restrained set of connecting lines as
 * THREE.LineSegments, and a handful of loose particles outside the
 * sphere for depth. No lights are required — everything here is
 * self-lit (unlit point/line materials), which keeps it cheap on
 * mobile and avoids depending on any external asset.
 */
export default function NetworkSphere({
  nodeCount,
  radius = 1,
  maxConnectionsPerNode = 3,
  connectionDistance = 0.55,
  accentRatio = 0.12,
}: NetworkSphereProps) {
  const { nodesGeometry, nodesMaterial, linesGeometry, linesMaterial, particlesGeometry, particlesMaterial } =
    useMemo(() => {
      const nodes = fibonacciSpherePoints(nodeCount, radius);

      // --- Nodes (points) ---
      const nodePositions = new Float32Array(nodes.length * 3);
      const nodeColors = new Float32Array(nodes.length * 3);
      const inkColor = new THREE.Color("#0a0a0a");
      const accentColor = new THREE.Color("#ff3b30");
      nodes.forEach((p, i) => {
        nodePositions[i * 3] = p.x;
        nodePositions[i * 3 + 1] = p.y;
        nodePositions[i * 3 + 2] = p.z;
        const isAccent = i % Math.round(1 / accentRatio) === 0;
        const c = isAccent ? accentColor : inkColor;
        nodeColors[i * 3] = c.r;
        nodeColors[i * 3 + 1] = c.g;
        nodeColors[i * 3 + 2] = c.b;
      });
      const nodesGeometry = new THREE.BufferGeometry();
      nodesGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
      nodesGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

      const nodesMaterial = new THREE.PointsMaterial({
        size: radius * 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        sizeAttenuation: true,
        depthWrite: false,
      });

      // --- Connections (line segments) ---
      // Nearest-neighbour connections, capped per node, so the result
      // reads as a controlled network rather than a chaotic web.
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
      linesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(linePositions), 3)
      );
      const linesMaterial = new THREE.LineBasicMaterial({
        color: "#0a0a0a",
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      });

      // --- Loose particles outside the sphere (sparse, for depth) ---
      const particleCount = Math.round(nodeCount * 0.35);
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const dir = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize();
        const dist = radius * (1.25 + Math.random() * 0.9);
        particlePositions[i * 3] = dir.x * dist;
        particlePositions[i * 3 + 1] = dir.y * dist;
        particlePositions[i * 3 + 2] = dir.z * dist;
      }
      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        size: radius * 0.02,
        color: "#0a0a0a",
        transparent: true,
        opacity: 0.25,
        sizeAttenuation: true,
        depthWrite: false,
      });

      return { nodesGeometry, nodesMaterial, linesGeometry, linesMaterial, particlesGeometry, particlesMaterial };
    }, [nodeCount, radius, maxConnectionsPerNode, connectionDistance, accentRatio]);

  return (
    <group>
      {/* Very subtle holographic core — soft, additive, no bloom pipeline needed. */}
      <mesh>
        <sphereGeometry args={[radius * 0.7, 24, 24]} />
        <meshBasicMaterial color="#0a0a0a" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <lineSegments geometry={linesGeometry} material={linesMaterial} />
      <points geometry={nodesGeometry} material={nodesMaterial} />
      <points geometry={particlesGeometry} material={particlesMaterial} />
    </group>
  );
}
