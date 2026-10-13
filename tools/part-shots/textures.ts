import * as THREE from "three";

/**
 * Surface detail for the product shots, drawn once on canvases: a dev
 * board's solder mask and silkscreen, and the marking on its chip.
 */

const MONO = "'Fragment Mono', 'Cascadia Mono', Consolas, monospace";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function texture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Seeded noise so every render matches. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * A small dev board, top side: black solder mask, copper traces showing
 * through as slightly lifted lines, white silkscreen, gold pads along
 * both long edges (castellated), and the outline of its parts.
 */
export function boardTexture() {
  const [c, g] = canvas(1040, 440);
  g.fillStyle = "#0e0f10";
  g.fillRect(0, 0, 1040, 440);
  const rnd = seeded(41);
  // Traces under the mask.
  g.strokeStyle = "rgba(60,64,62,0.9)";
  g.lineWidth = 4;
  g.lineCap = "round";
  for (let i = 0; i < 46; i++) {
    let x = 60 + rnd() * 920;
    let y = 40 + rnd() * 360;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      if (k % 2) x += (rnd() - 0.5) * 260;
      else y += (rnd() - 0.5) * 180;
      g.lineTo(Math.max(30, Math.min(1010, x)), Math.max(30, Math.min(410, y)));
    }
    g.stroke();
  }
  // Vias.
  for (let i = 0; i < 70; i++) {
    const x = 50 + rnd() * 940;
    const y = 40 + rnd() * 360;
    g.fillStyle = "#b8923f";
    g.beginPath();
    g.arc(x, y, 5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#0b0b0b";
    g.beginPath();
    g.arc(x, y, 2.2, 0, Math.PI * 2);
    g.fill();
  }
  // Castellated pads along the long edges.
  g.fillStyle = "#d4a84f";
  for (let i = 0; i < 20; i++) {
    const x = 40 + i * 50;
    g.fillRect(x, 0, 26, 30);
    g.fillRect(x, 410, 26, 30);
  }
  // Silkscreen.
  g.strokeStyle = "#e9e6dc";
  g.fillStyle = "#e9e6dc";
  g.lineWidth = 3;
  g.strokeRect(390, 140, 180, 180);
  g.strokeRect(640, 160, 120, 90);
  g.font = `400 26px ${MONO}`;
  g.fillText("MP-CTL-01", 70, 120);
  g.fillText("U1", 400, 350);
  g.fillText("BOOT", 820, 360);
  g.fillText("RST", 820, 110);
  for (let i = 0; i < 20; i++) {
    g.font = `400 14px ${MONO}`;
    g.fillText(String(i).padStart(2, "0"), 40 + i * 50, 56);
  }
  return texture(c);
}

/** Laser marking on a black chip package. */
export function chipTexture(lines: string[]) {
  const [c, g] = canvas(256, 256);
  g.fillStyle = "#151515";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(200,200,200,0.55)";
  g.font = `400 30px ${MONO}`;
  lines.forEach((line, i) => g.fillText(line, 26, 92 + i * 40));
  g.beginPath();
  g.arc(36, 36, 9, 0, Math.PI * 2);
  g.fill();
  return texture(c);
}
