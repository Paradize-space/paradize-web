import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Geometry for the Macropad. One unit is 10 mm.
 *
 * Built for drawing cheaply: every part that never moves on its own is
 * merged with its siblings into one geometry per material (nine switch
 * housings are one mesh, not nine), so the whole keypad is under fifty
 * draw calls. The keycaps and the key lights stay separate meshes
 * because the build presses and lights them one at a time.
 *
 * The case and board widen between revisions. Rev B is a morph target
 * made by sliding Rev A's right-hand vertices outward, so the two
 * layouts match by construction and the rounded corners travel intact.
 */

// ---- Dimensions --------------------------------------------------------

export const PITCH = 1.905; // standard key pitch, 19.05 mm
export const DEPTH = 6.9;
export const LEFT = -3.45; // left outer edge, the same for both revisions
export const WIDTH_A = 6.9;
export const WIDTH_B = 9.1;
export const KNOB_X = 4.55;
const WALL = 0.32;

/** Heights, bottom of each part, in units. */
export const Y = {
  board: 0.42,
  switchBase: 0.605,
  plate: 1.05,
  switchTop: 1.2,
  stem: 1.74,
  cap: 1.92,
  knob: 1.55,
} as const;

/** Key centres (x, z), row-major, back row first. */
export const KEYS: [number, number][] = [-1, 0, 1].flatMap((row) =>
  [-1, 0, 1].map((col) => [col * PITCH, row * PITCH] as [number, number]),
);
/** The orange key, top right. */
export const ACCENT_KEY = 2;

/** Where the knob-bay cover starts, and its width once Rev B is in. */
export const COVER_X0 = PITCH * 1.5 + 0.35;
export const COVER_W = LEFT + WIDTH_B - WALL - COVER_X0;

// ---- Helpers -----------------------------------------------------------

function roundedRect(x: number, z: number, w: number, d: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(x + r, z);
  s.lineTo(x + w - r, z);
  s.quadraticCurveTo(x + w, z, x + w, z + r);
  s.lineTo(x + w, z + d - r);
  s.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
  s.lineTo(x + r, z + d);
  s.quadraticCurveTo(x, z + d, x, z + d - r);
  s.lineTo(x, z + r);
  s.quadraticCurveTo(x, z, x + r, z);
  return s;
}

function squareHole(x: number, z: number, size: number) {
  const p = new THREE.Path();
  p.moveTo(x, z);
  p.lineTo(x, z + size);
  p.lineTo(x + size, z + size);
  p.lineTo(x + size, z);
  p.lineTo(x, z);
  return p;
}

/** Extrude a shape upward by `h`, base at y = 0, with a soft bevel. */
function extrudeUp(shape: THREE.Shape, h: number, bevel = 0.04, curves = 8) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: h - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: curves,
  });
  // Extrusion runs along +z; stand it up so it runs along +y.
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
}

type Ring = {
  /** Height of the ring. */
  y: number;
  /** Width across (x) and depth (z). */
  w: number;
  d: number;
  /** Corner radius. */
  r: number;
  /** Shift in z, for a cap that leans back. */
  z?: number;
};

/**
 * A solid lofted through rounded rectangles, bottom ring first, closed
 * at the top. With `dish` the top sinks towards its centre, the way a
 * keycap's does. UVs are the plan view in units, so a tiling grain
 * texture lands at the same scale on every part.
 */
function loft(rings: Ring[], { dish = 0, corner = 8 } = {}) {
  const n = 4 * (corner + 1);
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const ring = ({ y, w, d, r, z = 0 }: Ring, scale = 1, dy = 0) => {
    const cw = w * scale;
    const cd = d * scale;
    const cr = Math.min(r * scale, cw / 2, cd / 2);
    const corners: [number, number, number][] = [
      [cw / 2 - cr, cd / 2 - cr, 0],
      [-(cw / 2 - cr), cd / 2 - cr, Math.PI / 2],
      [-(cw / 2 - cr), -(cd / 2 - cr), Math.PI],
      [cw / 2 - cr, -(cd / 2 - cr), (3 * Math.PI) / 2],
    ];
    for (const [cx, cz, a0] of corners)
      for (let k = 0; k <= corner; k++) {
        const a = a0 + (k / corner) * (Math.PI / 2);
        const x = cx + cr * Math.cos(a);
        const zz = cz + cr * Math.sin(a) + z;
        positions.push(x, y + dy, zz);
        uvs.push(x, zz);
      }
  };
  const join = (a: number, b: number) => {
    for (let j = 0; j < n; j++) {
      const p = a * n + j;
      const q = a * n + ((j + 1) % n);
      const pb = b * n + j;
      const qb = b * n + ((j + 1) % n);
      index.push(p, pb, q, q, pb, qb);
    }
  };
  rings.forEach((r) => ring(r));
  for (let i = 0; i < rings.length - 1; i++) join(i, i + 1);

  // The top: rings shrinking to the centre, sinking with the dish.
  const top = rings[rings.length - 1];
  const steps = [0.8, 0.55, 0.3, 0.1];
  steps.forEach((k, i) => {
    ring(top, k, -dish * (1 - k * k));
    join(rings.length - 1 + i, rings.length + i);
  });
  const centre = positions.length / 3;
  positions.push(0, top.y - dish, top.z ?? 0);
  uvs.push(0, top.z ?? 0);
  const last = (rings.length - 1 + steps.length) * n;
  for (let j = 0; j < n; j++)
    index.push(last + j, centre, last + ((j + 1) % n));

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** Add the Rev B width as morph target 0 by sliding the right half out. */
function withWidening(g: THREE.BufferGeometry, split = 0) {
  const target = g.getAttribute("position").clone();
  for (let i = 0; i < target.count; i++) {
    if (target.getX(i) > split)
      target.setX(i, target.getX(i) + (WIDTH_B - WIDTH_A));
  }
  g.morphAttributes.position = [target];
  g.morphAttributes.normal = [g.getAttribute("normal").clone()];
  g.morphTargetsRelative = false;
  return g;
}

/** One copy of `part` at each key, merged into a single geometry. */
function atEveryKey(part: THREE.BufferGeometry, y: number) {
  const copies = KEYS.map(([x, z]) => part.clone().translate(x, y, z));
  const merged = mergeGeometries(copies);
  copies.forEach((c) => c.dispose());
  return merged;
}

// ---- Parts -------------------------------------------------------------

/** The case: walls with a soft top edge and the floor, as one mesh. */
export function caseGeometry() {
  const outer = roundedRect(LEFT, -DEPTH / 2, WIDTH_A, DEPTH, 0.5);
  outer.holes.push(
    roundedRect(
      LEFT + WALL,
      -DEPTH / 2 + WALL,
      WIDTH_A - WALL * 2,
      DEPTH - WALL * 2,
      0.26,
    ),
  );
  const walls = extrudeUp(outer, 1.3, 0.08);
  const floor = extrudeUp(
    roundedRect(LEFT + 0.1, -DEPTH / 2 + 0.1, WIDTH_A - 0.2, DEPTH - 0.2, 0.42),
    0.22,
    0.03,
  );
  return withWidening(mergeGeometries([walls, floor]));
}

/** The circuit board, which widens with the case. */
export function boardGeometry() {
  const inset = 0.45;
  return withWidening(
    extrudeUp(
      roundedRect(
        LEFT + inset,
        -DEPTH / 2 + inset,
        WIDTH_A - inset * 2,
        DEPTH - inset * 2,
        0.12,
      ),
      0.16,
      0.02,
    ),
  );
}

/** Solder pads, two per key, merged. */
export function padsGeometry() {
  const pad = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10);
  const pair = mergeGeometries([
    pad.clone().translate(-0.35, 0, 0.3),
    pad.clone().translate(0.25, 0, 0.45),
  ]);
  return atEveryKey(pair, Y.board + 0.17);
}

/** The controller module that sits on the board, with its USB-C port. */
export function controllerGeometries() {
  const at = new THREE.Vector3(-1.9, Y.board + 0.2, -2.6);
  return {
    board: new THREE.BoxGeometry(2.1, 0.1, 1.0).translate(at.x, at.y, at.z),
    chip: new THREE.BoxGeometry(0.7, 0.1, 0.7).translate(
      at.x,
      at.y + 0.1,
      at.z,
    ),
    port: new THREE.BoxGeometry(0.9, 0.3, 0.3).translate(
      at.x,
      at.y + 0.12,
      at.z - 0.45,
    ),
  };
}

/** The brass switch plate over the nine keys. */
export function plateGeometry() {
  const half = PITCH * 1.5 + 0.35;
  const shape = roundedRect(-half, -half, half * 2, half * 2, 0.18);
  const cut = 1.4;
  for (const [x, z] of KEYS)
    shape.holes.push(squareHole(x - cut / 2, -z - cut / 2, cut));
  return extrudeUp(shape, 0.15, 0.03, 10);
}

/** The four screws that hold the plate, one in each corner. */
export function plateScrewsGeometry() {
  const at = PITCH * 1.5 + 0.35 - 0.24;
  const head = mergeGeometries([
    new THREE.CylinderGeometry(0.12, 0.13, 0.05, 20).translate(0, 0.025, 0),
    // The hex socket, as a dark dimple: a small cylinder sunk in.
    new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6).translate(0, 0.045, 0),
  ]);
  const four = [
    [-at, -at],
    [at, -at],
    [-at, at],
    [at, at],
  ].map(([x, z]) => head.clone().translate(x, Y.plate + 0.15, z));
  const merged = mergeGeometries(four);
  four.forEach((g) => g.dispose());
  head.dispose();
  return merged;
}

/** The knob-bay cover, drawn from its left edge so it can grow rightward. */
export function coverGeometry() {
  return new THREE.BoxGeometry(
    COVER_W,
    0.15,
    DEPTH - WALL * 2 - 0.02,
  ).translate(COVER_W / 2, 0.075, 0);
}

/**
 * Switches, after a Cherry MX: a square lower housing with a slight
 * draft, a smoked upper housing whose sides slope in towards the top,
 * and the red cross stem standing out of it. Nine of each, merged.
 */
export function switchGeometries() {
  const stem = mergeGeometries([
    new THREE.BoxGeometry(0.42, 0.28, 0.12),
    new THREE.BoxGeometry(0.12, 0.28, 0.42),
    // The stem's square shoulder, where it leaves the housing.
    new THREE.BoxGeometry(0.5, 0.06, 0.5).translate(0, -0.17, 0),
  ]);
  const base = loft([
    { y: 0, w: 1.4, d: 1.4, r: 0.05 },
    { y: 0.4, w: 1.37, d: 1.37, r: 0.06 },
    { y: 0.45, w: 1.33, d: 1.33, r: 0.08 },
  ]);
  const top = loft([
    { y: 0, w: 1.38, d: 1.38, r: 0.06 },
    { y: 0.08, w: 1.36, d: 1.36, r: 0.07 },
    { y: 0.5, w: 1.06, d: 1.1, r: 0.12 },
    { y: 0.55, w: 1.0, d: 1.04, r: 0.13 },
  ]);
  return {
    base: atEveryKey(base, Y.switchBase),
    top: atEveryKey(top, Y.switchTop),
    stem: atEveryKey(stem, Y.stem + 0.14),
  };
}

/**
 * A sculpted keycap, lofted through rounded rectangles: straight-sided
 * near the skirt, rolling in over the shoulder, leaning back a touch,
 * and dished on top so the light catches its rim.
 */
export function keycapGeometry() {
  return loft(
    [
      { y: 0.0, w: 1.8, d: 1.8, r: 0.12 },
      { y: 0.1, w: 1.79, d: 1.79, r: 0.13 },
      { y: 0.42, w: 1.66, d: 1.69, r: 0.18, z: -0.015 },
      { y: 0.62, w: 1.54, d: 1.58, r: 0.25, z: -0.035 },
      { y: 0.72, w: 1.46, d: 1.5, r: 0.3, z: -0.048 },
      { y: 0.785, w: 1.39, d: 1.43, r: 0.33, z: -0.056 },
      { y: 0.8, w: 1.33, d: 1.37, r: 0.33, z: -0.06 },
    ],
    { dish: 0.055, corner: 10 },
  );
}

/** A knurled knob: a cylinder whose rim alternates in and out. */
export function knobGeometry() {
  const teeth = 60;
  const shape = new THREE.Shape();
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 ? 0.86 : 0.9;
    if (i) shape.lineTo(r * Math.cos(a), r * Math.sin(a));
    else shape.moveTo(r * Math.cos(a), r * Math.sin(a));
  }
  return extrudeUp(shape, 1.15, 0.05, 1);
}

/** The rotary encoder under the knob: body and shaft. */
export function encoderGeometries() {
  return {
    body: new THREE.BoxGeometry(1.25, 0.4, 1.25).translate(
      0,
      Y.board + 0.36,
      0,
    ),
    shaft: new THREE.CylinderGeometry(0.32, 0.32, 0.8, 20).translate(
      0,
      Y.board + 0.93,
      0,
    ),
  };
}

/** A key's light: a small square on the board, under the switch. */
export function ledGeometry() {
  return new THREE.BoxGeometry(0.34, 0.03, 0.22);
}

/**
 * The glow a lit key throws: a flat square just under the keycap,
 * added to the picture (additive blend) so it reads as light spill
 * round the cap's edges without any real light in the scene.
 */
export function glowGeometry() {
  return new THREE.PlaneGeometry(2.4, 2.4).rotateX(-Math.PI / 2);
}
