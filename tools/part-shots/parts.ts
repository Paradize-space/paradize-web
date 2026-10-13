import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import {
  keycapGeometry,
  knobGeometry,
  plateGeometry,
} from "../../components/film/scene/geometry";

import { boardTexture, chipTexture, seeded } from "./textures";

/**
 * The parts of Macropad Mk 1.1, modelled in detail for product shots,
 * in centimetres: dev boards with their chips, crystal and USB-C;
 * MX-style switches; keycaps; brass plates; threaded M2 screws;
 * encoders with threaded bushings and D-shafts; knurled knobs. Plus
 * the kit tray that holds a whole release, and the box it ships in.
 *
 * Built for offline rendering (see main.ts), so nothing here is
 * optimised for drawing in real time.
 */

// ---- Materials --------------------------------------------------------

const physical = (p: THREE.MeshPhysicalMaterialParameters) =>
  new THREE.MeshPhysicalMaterial(p);

const M = {
  powder: physical({
    color: 0x232427,
    roughness: 0.62,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
  }),
  rubber: physical({ color: 0x0c0c0c, roughness: 0.9 }),
  smoke: physical({
    color: 0xdedee6,
    transmission: 0.95,
    roughness: 0.04,
    thickness: 0.2,
    ior: 1.58,
    attenuationColor: new THREE.Color(0xa9aab4),
    attenuationDistance: 5,
    specularIntensity: 1,
  }),
  clear: physical({
    color: 0xffffff,
    transmission: 0.96,
    roughness: 0.05,
    thickness: 0.08,
    ior: 1.5,
  }),
  nylon: physical({ color: 0x141416, roughness: 0.55 }),
  smokeSwitch: physical({
    color: 0x6b6f78,
    transmission: 0.75,
    roughness: 0.25,
    thickness: 0.3,
    ior: 1.5,
  }),
  red: physical({ color: 0xc23a2a, roughness: 0.45 }),
  gold: physical({ color: 0xe1b45c, metalness: 1, roughness: 0.28 }),
  tin: physical({ color: 0xd9dbde, metalness: 1, roughness: 0.32 }),
  steel: physical({ color: 0xcfd2d6, metalness: 1, roughness: 0.3 }),
  darkSteel: physical({ color: 0x3a3c40, metalness: 1, roughness: 0.4 }),
  aluminium: physical({ color: 0xd6d8db, metalness: 1, roughness: 0.22 }),
  brass: physical({ color: 0xd2a75a, metalness: 1, roughness: 0.3 }),
  pbt: physical({
    color: 0xe6dfcf,
    roughness: 0.72,
    sheen: 0.4,
    sheenRoughness: 0.8,
  }),
  orange: physical({ color: 0xe8561c, roughness: 0.7, sheen: 0.3 }),
  black: physical({ color: 0x0d0d0e, roughness: 0.5 }),
  floor: physical({ color: 0x070707, roughness: 0.8 }),
};

// ---- Geometry helpers ---------------------------------------------------

const rbox = (w: number, h: number, d: number, r = 0.1, seg = 3) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2));

export type Piece = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
};
const merge = (parts: THREE.BufferGeometry[]) =>
  mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)));

/** A mesh from pieces sharing a material, posed with a matrix. */
const at = (g: THREE.BufferGeometry, m: THREE.Matrix4) =>
  g.clone().applyMatrix4(m);
const pose = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s = 1) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(s, s, s),
  );

// ---- Contents --------------------------------------------------------------

/** Everything stands on y = 0. */
const FLOOR = 0;

function controllerBoards(count = 2): Piece[] {
  const rnd = seeded(3);
  const top = new THREE.MeshPhysicalMaterial({
    map: boardTexture(),
    roughness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
  });
  const out: Piece[] = [];
  const chipMat = new THREE.MeshPhysicalMaterial({
    map: chipTexture(["PZ 2040", "2638 T1"]),
    roughness: 0.55,
  });
  for (const [x, z, ry] of (
    [
      [-1.4, -4.6, 0.18],
      [2.0, -9.2, -0.32],
    ] as const
  ).slice(0, count)) {
    const m = pose(x, FLOOR + 0.09, z, 0, ry, 0);
    // The board's body, and its printed top as a sheet just above it.
    out.push({
      geometry: at(rbox(5.2, 0.16, 2.2, 0.03), m),
      material: M.black,
    });
    out.push({
      geometry: at(
        new THREE.PlaneGeometry(5.16, 2.16)
          .rotateX(-Math.PI / 2)
          .translate(0, 0.081, 0),
        m,
      ),
      material: top,
    });
    // Parts on the board, in board coordinates.
    const parts = [
      {
        g: new THREE.BoxGeometry(0.72, 0.09, 0.72).translate(0.0, 0.125, 0),
        mat: chipMat,
      },
      {
        g: new THREE.BoxGeometry(0.5, 0.12, 0.38).translate(1.1, 0.14, 0.4),
        mat: M.black,
      },
      {
        g: rbox(0.34, 0.1, 0.2, 0.04).translate(-0.9, 0.13, 0.5),
        mat: M.steel,
      },
      {
        g: rbox(0.92, 0.32, 0.74, 0.12, 4).translate(-2.45, 0.24, 0),
        mat: M.steel,
      },
      {
        g: rbox(0.36, 0.16, 0.36, 0.05).translate(1.9, 0.16, -0.65),
        mat: M.black,
      },
      {
        g: new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16).translate(
          1.9,
          0.26,
          -0.65,
        ),
        mat: M.steel,
      },
      {
        g: rbox(0.36, 0.16, 0.36, 0.05).translate(1.9, 0.16, 0.65),
        mat: M.black,
      },
    ];
    for (let i = 0; i < 18; i++)
      parts.push({
        g: new THREE.BoxGeometry(0.12, 0.06, 0.07).translate(
          -1.6 + rnd() * 3.2,
          0.11,
          -0.8 + rnd() * 1.6,
        ),
        mat: rnd() > 0.5 ? M.black : M.brass,
      });
    for (const p of parts) out.push({ geometry: at(p.g, m), material: p.mat });
  }
  return out;
}

function switchSet(): Piece[] {
  const rnd = seeded(11);
  const base = rbox(1.4, 0.55, 1.4, 0.08);
  const top = rbox(1.26, 0.48, 1.26, 0.1).translate(0, 0.5, 0);
  const stem = merge([
    new THREE.BoxGeometry(0.42, 0.36, 0.13),
    new THREE.BoxGeometry(0.13, 0.36, 0.42),
  ]).translate(0, 0.9, 0);
  const pins = merge([
    new THREE.CylinderGeometry(0.035, 0.035, 0.36, 8).translate(
      -0.38,
      -0.45,
      0.2,
    ),
    new THREE.CylinderGeometry(0.035, 0.035, 0.36, 8).translate(
      0.25,
      -0.45,
      0.4,
    ),
  ]);
  const groups = {
    base: [] as THREE.BufferGeometry[],
    top: [] as THREE.BufferGeometry[],
    stem: [] as THREE.BufferGeometry[],
    pins: [] as THREE.BufferGeometry[],
  };
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const lying = rnd() < 0.3;
      const x = -3.3 + i * 2.2 + (rnd() - 0.5) * 0.5;
      const z = -2.2 - j * 2.3 + (rnd() - 0.5) * 0.5;
      const m = lying
        ? pose(x, FLOOR + 0.7, z, Math.PI / 2, rnd() * Math.PI, 0)
        : pose(x, FLOOR + 0.28, z, 0, rnd() * Math.PI, 0);
      groups.base.push(at(base, m));
      groups.top.push(at(top, m));
      groups.stem.push(at(stem, m));
      groups.pins.push(at(pins, m));
    }
  return [
    { geometry: merge(groups.base), material: M.nylon },
    { geometry: merge(groups.top), material: M.smokeSwitch },
    { geometry: merge(groups.stem), material: M.red },
    { geometry: merge(groups.pins), material: M.gold },
  ];
}

function keycapSet(): Piece[] {
  const rnd = seeded(5);
  const cap = keycapGeometry();
  const cream: THREE.BufferGeometry[] = [];
  const orange: THREE.BufferGeometry[] = [];
  let k = 0;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++) {
      const m = pose(
        -3.6 + i * 2.4 + (rnd() - 0.5) * 0.4,
        FLOOR,
        -2.4 - j * 2.5 + (rnd() - 0.5) * 0.4,
        0,
        (rnd() - 0.5) * 0.6,
        0,
      );
      (k++ === 5 || k === 10 ? orange : cream).push(at(cap, m));
    }
  return [
    { geometry: merge(cream), material: M.pbt },
    { geometry: merge(orange), material: M.orange },
  ];
}

function plates(): Piece[] {
  const plate = plateGeometry();
  return [
    {
      geometry: merge([
        at(plate, pose(-0.4, FLOOR, -5.2, 0, 0.08, 0)),
        at(plate, pose(0.3, FLOOR + 0.16, -5.6, 0, -0.12, 0)),
      ]),
      material: M.brass,
    },
  ];
}

/** An M2 screw lying on its side: socket head and a threaded shank. */
function screwGeometries() {
  const thread: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= 14; i++)
    thread.push(new THREE.Vector2(i % 2 ? 0.085 : 0.1, i * 0.045));
  thread.push(new THREE.Vector2(0, 14 * 0.045));
  const shank = new THREE.LatheGeometry(thread, 16).translate(0, -0.63, 0);
  const head = new THREE.CylinderGeometry(0.19, 0.19, 0.16, 24).translate(
    0,
    0.08,
    0,
  );
  const socket = new THREE.CylinderGeometry(0.085, 0.085, 0.02, 6).translate(
    0,
    0.165,
    0,
  );
  return { steel: merge([shank, head]), socket };
}

function screwPile(): Piece[] {
  const rnd = seeded(23);
  const { steel, socket } = screwGeometries();
  const s: THREE.BufferGeometry[] = [];
  const k: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 30; i++) {
    const r = Math.sqrt(rnd()) * 2.6;
    const a = rnd() * Math.PI * 2;
    const m = pose(
      Math.cos(a) * r * 1.3,
      FLOOR + 0.19 + (rnd() < 0.2 ? 0.2 : 0),
      -5 + Math.sin(a) * r,
      0,
      rnd() * Math.PI * 2,
      Math.PI / 2 + (rnd() - 0.5) * 0.2,
    );
    s.push(at(steel, m));
    k.push(at(socket, m));
  }
  return [
    { geometry: merge(s), material: M.steel },
    { geometry: merge(k), material: M.black },
  ];
}

function encoders(count = 2): Piece[] {
  const thread: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= 10; i++)
    thread.push(new THREE.Vector2(i % 2 ? 0.32 : 0.36, i * 0.05));
  thread.push(new THREE.Vector2(0, 0.5));
  const d = new THREE.Shape();
  d.absarc(0, 0, 0.3, -1.1, Math.PI + 1.1, false);
  d.closePath();
  const shaft = new THREE.ExtrudeGeometry(d, {
    depth: 1.3,
    bevelEnabled: false,
    curveSegments: 16,
  }).rotateX(-Math.PI / 2);
  const parts = {
    base: [] as THREE.BufferGeometry[],
    can: [] as THREE.BufferGeometry[],
    metal: [] as THREE.BufferGeometry[],
  };
  for (const [x, z, ry] of (
    [
      [-1.6, -2.6, 0.3],
      [1.9, -3.4, -0.5],
    ] as const
  ).slice(0, count)) {
    const m = pose(x, FLOOR, z, 0, ry, 0);
    parts.base.push(at(rbox(1.3, 0.35, 1.3, 0.05).translate(0, 0.33, 0), m));
    parts.can.push(at(rbox(1.25, 0.45, 1.25, 0.05).translate(0, 0.73, 0), m));
    parts.metal.push(
      at(new THREE.LatheGeometry(thread, 24).translate(0, 0.95, 0), m),
    );
    parts.metal.push(at(shaft.clone().translate(0, 1.45, 0), m));
    for (let p = -1; p <= 1; p++)
      parts.metal.push(
        at(
          new THREE.BoxGeometry(0.08, 0.32, 0.04).translate(
            p * 0.25,
            0.08,
            0.6,
          ),
          m,
        ),
      );
  }
  return [
    { geometry: merge(parts.base), material: M.black },
    { geometry: merge(parts.can), material: M.darkSteel },
    { geometry: merge(parts.metal), material: M.tin },
  ];
}

function knobs(count = 2): Piece[] {
  const knob = knobGeometry();
  const groove = new THREE.BoxGeometry(0.06, 0.02, 0.5).translate(
    0,
    1.16,
    0.45,
  );
  return [
    {
      geometry: merge(
        [
          at(knob, pose(-1.4, FLOOR, -2.8, 0, 0.4, 0)),
          at(knob, pose(1.8, FLOOR + 0.9, -3.2, Math.PI / 2, 0.9, 0)),
        ].slice(0, count),
      ),
      material: M.aluminium,
    },
    {
      geometry: merge(
        [
          at(groove, pose(-1.4, FLOOR, -2.8, 0, 0.4, 0)),
          at(groove, pose(1.8, FLOOR + 0.9, -3.2, Math.PI / 2, 0.9, 0)),
        ].slice(0, count),
      ),
      material: M.black,
    },
  ];
}

export const partsFor: Record<string, () => Piece[]> = {
  controller: controllerBoards,
  switches: switchSet,
  keycaps: keycapSet,
  plate: plates,
  screws: screwPile,
  encoder: encoders,
  knob: knobs,
};

// ---- The kit and its box --------------------------------------------------
