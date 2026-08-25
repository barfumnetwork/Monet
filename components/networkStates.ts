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
  { id: "hero", position: [0.6, 0.05, -0.2], rotation: [0.1, 0.4, 0], scale: 2.1 },
  // 1 — Connection: pulled a bit closer, more of the mesh visible.
  { id: "connection", position: [0.4, 0.0, 0.3], rotation: [0.15, 1.3, 0.05], scale: 2.35 },
  // 2 — Growth: larger, motion reads as expansion.
  { id: "growth", position: [-0.35, 0.05, 0.2], rotation: [0.05, 2.4, -0.05], scale: 2.7 },
  // 3 — Community: centred, network character front and center.
  { id: "community", position: [0.0, -0.05, 0.6], rotation: [-0.05, 3.4, 0.05], scale: 3.0 },
  // 4 — Global: pulled back, rotation shifts, distant nodes read clearly.
  { id: "global", position: [0.45, 0.1, -0.6], rotation: [0.2, 4.6, -0.1], scale: 2.2 },
  // 5 — Final: left/centred, kept clear of the CTA column.
  { id: "final", position: [-0.6, 0.0, 0.0], rotation: [0.05, 5.6, 0.05], scale: 2.4 },
];

// Mobile/tablet multipliers (≤1023px).
export const MOBILE_SCALE_FACTOR = 0.85;
export const MOBILE_POSITION_FACTOR = 0.3;
