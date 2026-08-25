"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import NetworkModel from "./NetworkModel";

export default function Scene() {
  // ≤1023px = mobile + tablet. Node/connection budget drops on this tier.
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  }, []);

  return (
    <Canvas
      dpr={isMobile ? [0.85, 1.1] : [1, 2]}
      gl={{
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? "low-power" : "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={32} />
      {/* Nodes/lines are unlit (self-coloured) materials, so no light
          rig is required — this keeps the scene cheap on mobile. */}
      <NetworkModel isMobile={isMobile} />
    </Canvas>
  );
}
