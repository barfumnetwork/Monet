"use client";

import { useEffect, useState } from "react";
import { lockScroll, onNetworkReady, markIntroStart } from "@/lib/sceneReady";

// CRITICAL: do NOT import anything from @react-three/drei here. drei would
// transitively pull all of three.js into the initial JS bundle and undo
// the code-splitting performed by SceneClient. The authoritative "ready"
// signal is the networkReady event fired by NetworkModel once its
// geometry/materials are actually built; the bar is a pure CSS keyframe
// loop (loading-bar), not a real progress indicator.
export default function LoadingScreen() {
  const [networkReady, setNetworkReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    lockScroll();
  }, []);

  useEffect(() => onNetworkReady(() => setNetworkReady(true)), []);

  useEffect(() => {
    if (!networkReady || hidden) return;
    const hold = window.setTimeout(() => {
      setHidden(true);
      // 520ms ≈ matches the CSS opacity transition (0.5s) so introStart
      // fires the instant the overlay is fully transparent.
      window.setTimeout(() => markIntroStart(), 520);
    }, 280);
    return () => window.clearTimeout(hold);
  }, [networkReady, hidden]);

  return (
    <div
      className={`loading-screen${hidden ? " loading-screen--hidden" : ""}`}
      aria-hidden={hidden}
      role="status"
      aria-live="polite"
    >
      <div className="loading-screen__inner">
        <img
          src="/logo.png"
          alt="BARFÜM NETWORK"
          className="loading-screen__logo-img"
        />
        <div className="loading-screen__caption">Dein Netzwerk wird vorbereitet</div>
        <div className="loading-screen__bar" aria-hidden>
          <div className="loading-screen__bar-fill" />
        </div>
        <span className="sr-only">Netzwerk-Erlebnis wird geladen</span>
      </div>
    </div>
  );
}
