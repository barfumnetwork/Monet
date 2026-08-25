"use client";

import { useEffect, useRef } from "react";

export type Ripple = {
  // Normalized device coords of the touch/click, -1..1 on both axes.
  x: number;
  y: number;
  // Seconds since the ripple was created.
  age: number;
  strength: number;
};

const MAX_RIPPLES = 5;
const RIPPLE_LIFETIME = 2.2; // seconds

/**
 * Collects touch/pointer contacts anywhere on the page and exposes them
 * as a short-lived list of ripples. The 3D scene reads this list every
 * frame to displace nodes — producing a "touching water" response on
 * mobile without any physics library.
 *
 * Listeners are passive and attached to window (the canvas itself is
 * pointer-events:none), so this never interferes with scrolling or with
 * tapping links/buttons.
 */
export function useRipples() {
  const ripplesRef = useRef<Ripple[]>([]);

  useEffect(() => {
    const add = (clientX: number, clientY: number, strength: number) => {
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -((clientY / window.innerHeight) * 2 - 1);
      const list = ripplesRef.current;
      list.push({ x, y, age: 0, strength });
      // Cap the list so a rapid tapper can't grow it without bound.
      if (list.length > MAX_RIPPLES) list.splice(0, list.length - MAX_RIPPLES);
    };

    const onTouch = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        add(e.touches[i].clientX, e.touches[i].clientY, 1);
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // already handled above
      add(e.clientX, e.clientY, 0.75);
    };

    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  // Called once per frame by the scene: ages ripples and drops dead ones.
  const tick = (delta: number) => {
    const list = ripplesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].age += delta;
      if (list[i].age > RIPPLE_LIFETIME) list.splice(i, 1);
    }
    return list;
  };

  return { ripplesRef, tick, RIPPLE_LIFETIME };
}
