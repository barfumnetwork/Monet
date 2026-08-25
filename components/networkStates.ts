export type NetworkState = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

// Six dramaturgical states for the network sphere. Values are the
// project's own — chosen once for pacing and framing, not re-tuned
// per test run.
export const NETWORK_STATES: NetworkState[] = [
  // 0 — Hero: sphere large, right side, slightly behind the hero text.
  { id: "hero", position: [0.85, 0.05, -0.2], rotation: [0.1, 0.4, 0], scale: 1.35 },
  // 1 — Connection: pulled a bit closer, more of the mesh visible.
  { id: "connection", position: [0.55, 0.0, 0.3], rotation: [0.15, 1.3, 0.05], scale: 1.5 },
  // 2 — Growth: larger, motion reads as expansion.
  { id: "growth", position: [-0.5, 0.05, 0.2], rotation: [0.05, 2.4, -0.05], scale: 1.75 },
  // 3 — Community: centred, network character front and center.
  { id: "community", position: [0.0, -0.05, 0.6], rotation: [-0.05, 3.4, 0.05], scale: 1.9 },
  // 4 — Global: pulled back, rotation shifts, distant nodes read clearly.
  { id: "global", position: [0.6, 0.1, -0.6], rotation: [0.2, 4.6, -0.1], scale: 1.3 },
  // 5 — Final: left/centred, kept clear of the CTA column.
  { id: "final", position: [-0.85, 0.0, 0.0], rotation: [0.05, 5.6, 0.05], scale: 1.5 },
];

// Mobile/tablet multipliers (≤1023px).
export const MOBILE_SCALE_FACTOR = 1.1;
export const MOBILE_POSITION_FACTOR = 0.15;
