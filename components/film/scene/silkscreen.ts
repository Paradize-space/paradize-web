import * as THREE from "three";

import { KEYS, KNOB_X, LEFT, WIDTH_A, WIDTH_B } from "./geometry";

/**
 * The circuit board's artwork: traces under the solder mask, the white
 * silkscreen (switch outlines, reference designators, mounting holes,
 * the board's name and revision), drawn once on a canvas and laid over
 * the board as a transparent decal. The film opens close on this board,
 * straight after the title screen's footage of a real one, so it has to
 * read as a board at a glance.
 *
 * Rev B is a second sheet, wider, with the encoder's footprint; the
 * keypad cross-fades to it as the case widens.
 */

/** Board edge inset from the case's outer edge (matches boardGeometry). */
const INSET = 0.45;
export const BOARD_X0 = LEFT + INSET;
export const BOARD_Z0 = -3.45 + INSET;
export const BOARD_DEPTH = 6.9 - INSET * 2;
export const boardWidth = (rev: "a" | "b") =>
  (rev === "a" ? WIDTH_A : WIDTH_B) - INSET * 2;

/** Canvas pixels per scene unit (10 mm). */
const PX = 128;

const SILK = "rgba(232,228,218,0.9)";
const TRACE = "rgba(150,160,150,0.16)";
const TRACE_EDGE = "rgba(255,255,255,0.05)";

export function silkscreenTexture(rev: "a" | "b") {
  const w = boardWidth(rev);
  const c = document.createElement("canvas");
  c.width = Math.round(w * PX);
  c.height = Math.round(BOARD_DEPTH * PX);
  const g = c.getContext("2d")!;
  // Scene units in, canvas pixels out; z runs down the canvas.
  g.scale(PX, PX);
  g.translate(-BOARD_X0, -BOARD_Z0);
  g.lineCap = "round";
  g.lineJoin = "round";

  const ctrl = { x: -1.9, z: -2.6 };

  // ---- Traces: each key's pads routed to the controller, row by row.
  const route = (pts: [number, number][]) => {
    g.beginPath();
    pts.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z)));
    g.strokeStyle = TRACE;
    g.lineWidth = 0.07;
    g.stroke();
    g.strokeStyle = TRACE_EDGE;
    g.lineWidth = 0.02;
    g.stroke();
  };
  KEYS.forEach(([x, z], i) => {
    const row = Math.floor(i / 3);
    const lane = ctrl.x - 0.7 + row * 0.35 + (i % 3) * 0.1;
    const bus = z + 0.95;
    route([
      [x + 0.25, z + 0.45],
      [x + 0.25, bus - 0.2],
      [x + 0.05, bus],
      [lane + 0.25, bus],
      [lane, bus - 0.25],
      [lane, ctrl.z + 0.55],
    ]);
    route([
      [x - 0.35, z + 0.3],
      [x - 0.75, z - 0.1],
      [x - 0.75, z - 0.75],
      [x - 0.55, z - 0.95],
    ]);
  });
  if (rev === "b") {
    route([
      [KNOB_X - 0.5, 0.9],
      [KNOB_X - 1.1, 1.5],
      [KNOB_X - 1.1, 2.75],
      [ctrl.x + 0.9, 2.75],
      [ctrl.x + 0.9, ctrl.z + 0.55],
    ]);
  }

  // ---- Silkscreen.
  g.strokeStyle = SILK;
  g.fillStyle = SILK;
  g.lineWidth = 0.028;

  const outline = (cx: number, cz: number, size: number) => {
    const h = size / 2;
    const t = size * 0.2;
    // Corner brackets only, the way switch footprints are usually drawn.
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      g.beginPath();
      g.moveTo(cx + sx * h, cz + sz * (h - t));
      g.lineTo(cx + sx * h, cz + sz * h);
      g.lineTo(cx + sx * (h - t), cz + sz * h);
      g.stroke();
    }
  };
  // Text is set in canvas pixels, outside the scaled transform, so the
  // font size is a whole number of pixels.
  const text = (s: string, x: number, z: number, size = 0.17) => {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.font = `${Math.round(size * PX)}px ui-monospace, Menlo, monospace`;
    g.textBaseline = "middle";
    g.fillText(s, (x - BOARD_X0) * PX, (z - BOARD_Z0) * PX);
    g.restore();
  };

  KEYS.forEach(([x, z], i) => {
    outline(x, z, 1.62);
    text(`SW${i + 1}`, x + 0.32, z - 0.62, 0.15);
    // The key's light, with its designator.
    g.strokeRect(x - 0.24, z - 0.58, 0.48, 0.26);
    text(`D${i + 1}`, x - 0.78, z - 0.45, 0.12);
  });

  // Mounting holes for the four M2 screws.
  const holes: [number, number][] = [
    [BOARD_X0 + 0.32, BOARD_Z0 + 0.32],
    [BOARD_X0 + w - 0.32, BOARD_Z0 + 0.32],
    [BOARD_X0 + 0.32, BOARD_Z0 + BOARD_DEPTH - 0.32],
    [BOARD_X0 + w - 0.32, BOARD_Z0 + BOARD_DEPTH - 0.32],
  ];
  for (const [x, z] of holes) {
    g.beginPath();
    g.arc(x, z, 0.16, 0, Math.PI * 2);
    g.stroke();
  }

  // The controller's footprint and the board's name along the front.
  g.strokeRect(ctrl.x - 1.12, ctrl.z - 0.42, 2.24, 1.0);
  text("U1", ctrl.x + 1.2, ctrl.z + 0.05, 0.13);
  text(
    `MACROPAD  REV ${rev.toUpperCase()}`,
    BOARD_X0 + 0.6,
    BOARD_Z0 + BOARD_DEPTH - 0.24,
    0.16,
  );

  if (rev === "b") {
    g.beginPath();
    g.arc(KNOB_X, 0, 0.95, 0, Math.PI * 2);
    g.stroke();
    outline(KNOB_X, 0, 1.4);
    text("ENC1", KNOB_X - 0.3, 1.25, 0.15);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
