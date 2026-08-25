"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  // Inner "liquid" wrapper — carries a small reactive wobble driven by
  // scroll velocity, layered on top of the GSAP-driven outer transform,
  // so the hologram feels like it's responding to the scroll itself
  // (a gentle water-like ripple) rather than just tweening between poses.
  const liquidRef = useRef<THREE.Group>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const nodeCount = isMobile ? 120 : 220;
  // Energy-stream budget scales down hard on mobile — the ripple maths
  // already costs per-node work there, so the aura stays cheap.
  const streamCount = isMobile ? 45 : 110;

  const sphere = useMemo(
    () => (
      <NetworkSphere
        nodeCount={nodeCount}
        radius={1}
        maxConnectionsPerNode={3}
        connectionDistance={0.55}
        streamCount={streamCount}
      />
    ),
    [nodeCount, streamCount]
  );

  useFrame(({ clock }) => {
    const g = liquidRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    // Constant gentle floating/breathing motion — present even without
    // any scrolling, so the hologram never looks static.
    const floatY = Math.sin(t * 0.5) * 0.03;
    const floatWobble = Math.sin(t * 0.35) * 0.02;

    // Scroll-velocity reactive tilt: the faster the user scrolls, the
    // more the hologram "leans"/ripples, then eases back — the closest
    // approximation to a liquid response without adding a physics lib.
    const st = scrollTriggerRef.current;
    const velocity = st ? st.getVelocity() : 0;
    const targetTilt = THREE.MathUtils.clamp(velocity / 2500, -0.22, 0.22);

    g.position.y = floatY;
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetTilt + floatWobble, 0.06);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetTilt * 0.4, 0.06);
  });

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

      // Slow, restrained turntable reveal — elegant, no hectic spin, no
      // position animation during the reveal itself.
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
        if (tl.scrollTrigger) scrollTriggerRef.current = tl.scrollTrigger;
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
      <group ref={liquidRef}>{sphere}</group>
    </group>
  );
}
