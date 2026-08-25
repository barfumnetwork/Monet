"use client";

// Coordination contract:
// Phase 1  page mount        LoadingScreen.lockScroll()
// Phase 2  Canvas mounts     <NetworkModel> builds its geometry
// Phase 3  geometry ready    NetworkModel.markNetworkReady()
//                            → LoadingScreen sees this, fades out
// Phase 4  fade complete     LoadingScreen.markIntroStart()
//                            → NetworkModel sees this, plays intro
// Phase 5  intro complete    NetworkModel.unlockScroll()

let originalHtml = "";
let originalBody = "";
let scrollLocked = false;

export const lockScroll = () => {
  if (typeof document === "undefined" || scrollLocked) return;
  scrollLocked = true;
  originalHtml = document.documentElement.style.overflow;
  originalBody = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);
};

export const unlockScroll = () => {
  if (typeof document === "undefined" || !scrollLocked) return;
  scrollLocked = false;
  document.documentElement.style.overflow = originalHtml;
  document.body.style.overflow = originalBody;
};

const NETWORK_READY = "lumen:networkReady";
let networkReady = false;

// Called once the network geometry + materials have actually been built
// (not on a fixed timer) — see NetworkModel.tsx.
export const markNetworkReady = () => {
  if (typeof window === "undefined" || networkReady) return;
  networkReady = true;
  window.dispatchEvent(new Event(NETWORK_READY));
};

export const onNetworkReady = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  if (networkReady) {
    queueMicrotask(cb);
    return () => {};
  }
  window.addEventListener(NETWORK_READY, cb, { once: true });
  return () => window.removeEventListener(NETWORK_READY, cb);
};

const INTRO_START = "lumen:introStart";
let introStarted = false;

export const markIntroStart = () => {
  if (typeof window === "undefined" || introStarted) return;
  introStarted = true;
  window.dispatchEvent(new Event(INTRO_START));
};

export const onIntroStart = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  if (introStarted) {
    queueMicrotask(cb);
    return () => {};
  }
  window.addEventListener(INTRO_START, cb, { once: true });
  return () => window.removeEventListener(INTRO_START, cb);
};
