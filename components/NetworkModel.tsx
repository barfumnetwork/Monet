"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import {
  NETWORK_STATES,
  MOBILE_SCALE_FACTOR,
  MOBILE_POSITION_FACTOR,
} from "./networkStates";
import {
  lockScroll,
  unlockScroll,
  markNetworkReady,
  onIntroStart,
} from "@/lib/sceneReady";
import NetworkSphere from "./NetworkSphere";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type NetworkModelProps = { isMobile: boolean };

export default function NetworkModel({ isMobile }: NetworkModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Node/connection budget — kept well inside the performance targets
  // (desktop ≤250 nodes, mobile ≤140 nodes).
  const nodeCount = isMobile ? 120 : 220;

  // The sphere geometry itself is static; only the surrounding group's
  // transform is animated (position/rotation/scale) via GSAP below.
  const sphere = useMemo(
    () => <NetworkSphere nodeCount={nodeCount} radius={1} maxConnectionsPerNode={3} connectionDistance={0.55} />,
    [nodeCount]
  );

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    const group = g;
    lockScroll();
    let cancelIntroSub: (() => void) | null = null;

    const ctx = gsap.context((self) => {
      const ps = isMobile ? MOBILE_POSITION_FACTOR : 1;
      const ss = isMobile ? MOBILE_SCALE_FACTOR : 1;
      const yOffset = isMobile ? 0.3 : 0;
      const hero = NETWORK_STATES[0];

      // Start pose set synchronously (pre-paint) so there's no flash of
      // an unpositioned sphere. Intro is rotation-only from an offset
      // start angle into the hero pose — no position slide.
      g.position.set(hero.position[0] * ps, hero.position[1] * ps + yOffset, hero.position[2] * ps);
      g.rotation.set(hero.rotation[0], hero.rotation[1] - 1.6, hero.rotation[2]);
      g.scale.setScalar(hero.scale * ss);

      gsap.set("[data-hero-text]", { opacity: 0, y: 22 });

      const intro = gsap.timeline({
        paused: true,
        onComplete: () => {
          unlockScroll();
          self.add(() => buildScrollTimeline());
        },
      });

      cancelIntroSub = onIntroStart(() => intro.play());

      // Slow, restrained turntable reveal — no hectic spin, no position
      // animation, matching the brief's "elegant and slow" requirement.
      intro.to(g.rotation, { y: hero.rotation[1], duration: 3.6, ease: "sine.inOut" }, 0);

      intro.to(
        "[data-hero-text]",
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.85, ease: "power2.out" },
        1.8
      );

      function buildScrollTimeline() {
        const tl = gsap.timeline({
          defaults: { duration: 1, ease: "none" },
          scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });
        for (let i = 1; i < NETWORK_STATES.length; i++) {
          const next = NETWORK_STATES[i];
          const at = i - 1;
          tl.to(
            group.position,
            {
              x: next.position[0] * ps,
              y: next.position[1] * ps + yOffset,
              z: next.position[2] * ps,
            },
            at
          )
            .to(group.rotation, { x: next.rotation[0], y: next.rotation[1], z: next.rotation[2] }, at)
            .to(group.scale, { x: next.scale * ss, y: next.scale * ss, z: next.scale * ss }, at);
        }
        ScrollTrigger.refresh();
      }
    });

    // Geometry/materials for the sphere are built synchronously in
    // NetworkSphere's useMemo before this layout effect runs, so by
    // this point the network is genuinely ready — not a guessed delay.
    markNetworkReady();

    return () => {
      cancelIntroSub?.();
      unlockScroll();
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <group ref={groupRef} dispose={null}>
      {sphere}
    </group>
  );
}
