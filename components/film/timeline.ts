/**
 * The film's single continuous shot: model dials and camera, keyed
 * against scroll progress 0 → 1, eased between keys so it never cuts.
 *
 *   0.00  close on the bare circuit board, picking up from the title
 *         screen's footage of one; the rest of the keypad is still away
 *   0.10  pull back while the plate, switches and caps land on it
 *   0.30  it comes apart: everything one release holds
 *   0.47  back together, the keycaps landing last, still seen wide
 *   0.50  seen from above
 *   0.60  the case widens and a knob rises in: the next release
 *   0.72  apart again; the parts the shelf lacks turn to glass
 *   0.875 everything goes home, the glass filling in
 *   0.90  the camera comes in
 *   1.00  keys press, lights come on: built
 *
 * `scenes` is the copy's schedule on the same axis.
 */

/** Scroll length of the film, in viewport heights. */
export const TRACK_VH = 860;

export type Pose = {
  /** 0: only the case and board are here; 1: every layer has landed. */
  assemble: number;
  explode: number;
  rev: number;
  ghost: number;
  build: number;
  spin: number;
  labels: number;
};

export type Shot = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** Slide the picture right, as a fraction of its width, on wide screens. */
  shift: number;
  /**
   * Lift the picture, as a fraction of its height, on narrow screens,
   * where words sit underneath. 0.27 when not given.
   */
  lift?: number;
};

type Key = { at: number; pose: Pose; shot: Shot };

const POSE_FIELDS = [
  "assemble",
  "explode",
  "rev",
  "ghost",
  "build",
  "spin",
  "labels",
] as const;

const still = (spin: number, labels = 0): Pose => ({
  assemble: 1,
  explode: 0,
  rev: 0,
  ghost: 0,
  build: 0,
  spin,
  labels,
});

const wide: Shot = {
  position: [13, 10.5, 17],
  target: [0.9, 1.0, 0],
  fov: 26,
  shift: 0.18,
};
const exploded: Shot = {
  position: [17, 17, 23],
  target: [0.6, 4.1, 0],
  fov: 30,
  shift: 0.2,
};
const above = (x: number): Shot => ({
  position: [x, 22, 8],
  target: [x, 0.6, 0],
  fov: 30,
  shift: 0.16,
});
const shelf: Shot = {
  position: [22, 12.5, 21],
  target: [1.7, 4.9, 0],
  fov: 30,
  shift: 0.19,
};

export const keys: Key[] = [
  {
    at: 0.0,
    pose: { ...still(-0.5), assemble: 0 },
    shot: {
      position: [4.2, 9.6, 8.8],
      target: [0.2, 0.45, 0.0],
      fov: 32,
      shift: 0.23,
    },
  },
  { at: 0.1, pose: still(-0.15), shot: wide },
  {
    at: 0.21,
    pose: still(0.1),
    shot: { ...wide, position: [12.5, 10, 16.5] },
  },
  { at: 0.3, pose: { ...still(0.35, 1), explode: 1 }, shot: exploded },
  {
    at: 0.42,
    pose: { ...still(0.6, 1), explode: 1 },
    shot: { ...exploded, position: [16, 18, 22], target: [0.6, 4.2, 0] },
  },
  // Back together before the camera moves overhead: the keycaps land
  // last, so the shot stays wide until they have.
  {
    at: 0.47,
    pose: still(0.3),
    shot: { ...exploded, position: [15, 17, 21], target: [0.8, 2.4, 0] },
  },
  { at: 0.5, pose: still(0), shot: above(1.2) },
  { at: 0.6, pose: { ...still(0), rev: 1 }, shot: above(1.4) },
  { at: 0.64, pose: { ...still(0), rev: 1 }, shot: above(1.4) },
  {
    at: 0.72,
    pose: { ...still(0.55), rev: 1, explode: 1, ghost: 1 },
    shot: shelf,
  },
  {
    at: 0.84,
    pose: { ...still(0.7), rev: 1, explode: 1, ghost: 1 },
    shot: { ...shelf, position: [21, 13, 22], target: [1.7, 5.0, 0] },
  },
  // As before: together first, then the camera comes in.
  {
    at: 0.875,
    pose: { ...still(0.5), rev: 1, ghost: 0.5 },
    shot: { ...shelf, position: [19, 13, 21], target: [1.5, 2.6, 0] },
  },
  {
    at: 0.9,
    pose: { ...still(0.35), rev: 1 },
    shot: {
      position: [16, 12, 19],
      target: [1.3, 1.0, 0],
      fov: 26,
      shift: 0.18,
    },
  },
  {
    at: 1.0,
    pose: { ...still(0.25), rev: 1, build: 1 },
    shot: {
      position: [15, 11, 18],
      target: [1.3, 1.1, 0],
      fov: 25,
      shift: 0.18,
    },
  },
];

/** The chapter list along the bottom bar. */
export const chapters = ["Paradize", "Publish", "Revise", "Check", "Build"];

/** When each passage of copy is on screen, and the chapter it belongs to. */
export const scenes = [
  { id: "why", chapter: 0, from: 0.0, to: 0.085 },
  { id: "what", chapter: 0, from: 0.11, to: 0.22 },
  { id: "publish", chapter: 1, from: 0.25, to: 0.43 },
  { id: "revise", chapter: 2, from: 0.46, to: 0.66 },
  { id: "check", chapter: 3, from: 0.69, to: 0.86 },
  { id: "build", chapter: 4, from: 0.89, to: 1.5 },
] as const;

export type SceneId = (typeof scenes)[number]["id"];

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const initialPose = (): Pose => ({ ...keys[0].pose });
export const initialShot = (): Shot => ({
  ...keys[0].shot,
  position: [...keys[0].shot.position],
  target: [...keys[0].shot.target],
});

/**
 * The way in, before the stage pins: the camera is still coming down
 * onto the board, swinging round a little as it lowers. `enter` runs
 * 0 → 1 as the film rises from the bottom of the screen to the top.
 */
export function approach(shot: Shot, enter: number) {
  const k = 1 - smooth(Math.min(1, Math.max(0, enter)));
  if (k <= 0) return;
  const [tx, , tz] = shot.target;
  const dx = shot.position[0] - tx;
  const dz = shot.position[2] - tz;
  const a = k * 0.35;
  shot.position[0] = tx + dx * Math.cos(a) - dz * Math.sin(a);
  shot.position[2] = tz + dx * Math.sin(a) + dz * Math.cos(a);
  shot.position[1] += k * 4;
}

/** Write the pose and shot for progress `p` into `pose` and `shot`. */
export function sample(p: number, pose: Pose, shot: Shot) {
  const t = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const k = smooth(Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at))));

  for (const f of POSE_FIELDS) pose[f] = mix(a.pose[f], b.pose[f], k);
  for (let j = 0; j < 3; j++) {
    shot.position[j] = mix(a.shot.position[j], b.shot.position[j], k);
    shot.target[j] = mix(a.shot.target[j], b.shot.target[j], k);
  }
  shot.fov = mix(a.shot.fov, b.shot.fov, k);
  shot.shift = mix(a.shot.shift, b.shot.shift, k);
}
