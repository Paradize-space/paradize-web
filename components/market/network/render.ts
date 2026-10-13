import type { Graph } from "./graph";
import { indexOf, ramp, steps } from "./story";

/**
 * Draws the network on a 2D canvas: the disc seen from above and in
 * front, each link an arc over it, parts travelling the arcs as small
 * lights. Plain 2D drawing with a hand-rolled perspective, which is
 * crisp at any size and cheap enough for an old phone.
 *
 * Everyday traffic runs underneath the story: parts arrive at builders
 * all over the disc, and now and then a build lights up where someone
 * copied someone else's project. The story's own links and parcels are
 * drawn brighter, on top.
 */

const TAU = Math.PI * 2;
/** Camera distance from the disc's centre, in disc radii. */
const DISTANCE = 2.7;
const INK = "241 241 241";

const PUBLISH = indexOf("publish");
const CHECK = indexOf("check");
const FIND = indexOf("find");
const SHIP = indexOf("ship");
const SPREAD = indexOf("spread");

export type Frame = {
  /** Running seconds, for the drift and the traffic. */
  now: number;
  step: number;
  /** Seconds into the step. */
  stepTime: number;
  /** The pointer, -1 to 1 each way, already eased. */
  tilt: [number, number];
  hover: number | null;
};

export type Anchor = { x: number; y: number; on: number };

export type Anchors = {
  /** Each named node's position on screen. */
  cast: Record<string, Anchor>;
  /** Each store's part on its way to the builder. */
  riders: Record<string, Anchor>;
};

type Parcel = { edge: number; start: number; length: number };

export class Network {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private cx = 0;
  private cy = 0;
  private focal = 0;
  /** How far the camera looks down at the disc, in radians. */
  private pitch = 0.5;
  private sx: Float32Array;
  private sy: Float32Array;
  private depth: Float32Array;
  /** Each edge's arc: the control point, on screen. */
  private qx: Float32Array;
  private qy: Float32Array;
  private flash: Float32Array;
  private parcels: Parcel[] = [];
  private pulses: Parcel[] = [];
  private nextParcel = 0;
  private nextPulse = 0;
  private seed = 1;
  private last = 0;
  private glow: HTMLCanvasElement;
  private background: number[];
  private builds: number[];
  /** Edge indices that touch each node, for the hover. */
  private touching: number[][];

  constructor(
    private canvas: HTMLCanvasElement,
    private graph: Graph,
    /** Parts arriving per second, across the whole disc. */
    private traffic: number,
  ) {
    this.ctx = canvas.getContext("2d")!;
    const n = graph.nodes.length;
    const m = graph.edges.length;
    this.sx = new Float32Array(n);
    this.sy = new Float32Array(n);
    this.depth = new Float32Array(n);
    this.flash = new Float32Array(n);
    this.qx = new Float32Array(m);
    this.qy = new Float32Array(m);

    const story = new Set([
      ...graph.story.follow,
      ...Object.values(graph.story.supply),
      ...graph.story.copy,
      ...graph.story.resupply,
    ]);
    this.background = graph.edges
      .map((e, i) => (e.kind === "supply" && !story.has(i) ? i : -1))
      .filter((i) => i >= 0);
    this.builds = graph.edges
      .map((e, i) => (e.kind === "build" && !story.has(i) ? i : -1))
      .filter((i) => i >= 0);
    this.touching = graph.nodes.map(() => []);
    graph.edges.forEach((e, i) => {
      this.touching[e.from].push(i);
      this.touching[e.to].push(i);
    });

    // A soft round light, drawn once and stamped wherever needed.
    this.glow = document.createElement("canvas");
    this.glow.width = this.glow.height = 64;
    const g = this.glow.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgb(${INK} / 0.9)`);
    grad.addColorStop(0.25, `rgb(${INK} / 0.35)`);
    grad.addColorStop(1, `rgb(${INK} / 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }

  /** Size the canvas, and frame the disc: its centre and its radius at
   *  the centre, in CSS pixels, and how steeply it is seen. */
  resize(
    width: number,
    height: number,
    dpr: number,
    frame: { cx: number; cy: number; radius: number; pitch: number },
  ) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.cx = frame.cx;
    this.cy = frame.cy;
    this.focal = frame.radius * DISTANCE;
    this.pitch = frame.pitch;
  }

  /** A node, and where it was last drawn. */
  node(i: number) {
    return this.graph.nodes[i];
  }
  peekIndex(i: number) {
    return { x: this.sx[i], y: this.sy[i] };
  }
  /** The node under a point, if one is close. */
  pick(x: number, y: number): number | null {
    let best: number | null = null;
    let bestD = 22;
    for (let i = 0; i < this.graph.nodes.length; i++) {
      const d = Math.hypot(this.sx[i] - x, this.sy[i] - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  private random() {
    // Small and seeded, so the traffic repeats the same way each visit.
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  /** A point on edge i's arc, t from its start (0) to its end (1). */
  private along(i: number, t: number): [number, number] {
    const e = this.graph.edges[i];
    const u = 1 - t;
    return [
      u * u * this.sx[e.from] + 2 * u * t * this.qx[i] + t * t * this.sx[e.to],
      u * u * this.sy[e.from] + 2 * u * t * this.qy[i] + t * t * this.sy[e.to],
    ];
  }

  /** Trace edge i's arc from t0 to t1. */
  private arc(i: number, t0 = 0, t1 = 1) {
    const e = this.graph.edges[i];
    const [ax, ay] = this.along(i, t0);
    const [bx, by] = this.along(i, t1);
    // The control point of the piece between t0 and t1.
    const a = (1 - t0) * (1 - t1);
    const b = (1 - t0) * t1 + t0 * (1 - t1);
    const c = t0 * t1;
    const qx = a * this.sx[e.from] + b * this.qx[i] + c * this.sx[e.to];
    const qy = a * this.sy[e.from] + b * this.qy[i] + c * this.sy[e.to];
    this.ctx.moveTo(ax, ay);
    this.ctx.quadraticCurveTo(qx, qy, bx, by);
  }

  /** How bright something at depth d is: near is full, far is faint. */
  private fade(d: number) {
    const near = DISTANCE - 1;
    return 1 - 0.7 * Math.min(1, Math.max(0, (d - near) / 2));
  }

  private stamp(x: number, y: number, size: number, alpha: number) {
    if (alpha <= 0.01) return;
    this.ctx.globalAlpha = Math.min(1, alpha);
    this.ctx.drawImage(this.glow, x - size / 2, y - size / 2, size, size);
    this.ctx.globalAlpha = 1;
  }

  draw(f: Frame): Anchors {
    const { ctx, graph } = this;
    const { nodes, edges, story, cast } = graph;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    // ---- Where everything is this frame ----------------------------------
    const yaw = 0.22 * Math.sin((f.now * TAU) / 48) + 0.16 * f.tilt[0];
    const pitch = this.pitch + 0.06 * f.tilt[1];
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const project = (x: number, y: number, z: number) => {
      const rx = x * cy - z * sy;
      const rz = x * sy + z * cy;
      const vy = y * cp - rz * sp;
      const d = DISTANCE - y * sp - rz * cp;
      return [
        this.cx + (this.focal * rx) / d,
        this.cy - (this.focal * vy) / d,
        d,
      ] as const;
    };
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const [x, y, d] = project(n.x, n.y, n.z);
      this.sx[i] = x;
      this.sy[i] = y;
      this.depth[i] = d;
    }
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const a = nodes[e.from];
      const b = nodes[e.to];
      const [mx, my] = project(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2 + e.lift,
        (a.z + b.z) / 2,
      );
      // The control point that puts the arc's middle over the midpoint.
      this.qx[i] = 2 * mx - (this.sx[e.from] + this.sx[e.to]) / 2;
      this.qy[i] = 2 * my - (this.sy[e.from] + this.sy[e.to]) / 2;
    }

    // ---- The story, from the step -----------------------------------------
    const { step, stepTime: t } = f;
    const length = steps[step].length;
    // Everything the story lit fades out at the very end, before it
    // starts again.
    const lit = step === SPREAD ? 1 - ramp(t, length - 0.6, 0.6) : 1;
    const follow = story.follow.map((_, k) =>
      step === PUBLISH ? ramp(t, 0.6 + k * 0.35, 1.1) : 1,
    );
    const storeNames = Object.keys(story.supply);
    const supplyDrawn = storeNames.map((_, k) =>
      step < FIND ? 0 : step === FIND ? ramp(t, 0.2 + k * 0.3, 1) : 1,
    );
    const shipped = storeNames.map((_, k) =>
      step < SHIP ? 0 : step === SHIP ? ramp(t, 0.2 + k * 0.25, 2.2) : 1,
    );
    const copied = story.copy.map((_, k) =>
      step === SPREAD ? ramp(t, 0.5 + k * 0.3, 1) : 0,
    );
    const resupplied = story.resupply.map((_, k) =>
      step === SPREAD ? ramp(t, 1.5 + k * 0.3, 1.5) : 0,
    );
    const { builder: builderId, maker: makerId } = graph.roles;

    // ---- Everyday traffic ---------------------------------------------------
    if (this.nextParcel === 0) this.nextParcel = f.now;
    while (f.now >= this.nextParcel && this.background.length) {
      const edge =
        this.background[Math.floor(this.random() * this.background.length)];
      const e = edges[edge];
      const span = Math.hypot(
        nodes[e.from].x - nodes[e.to].x,
        nodes[e.from].z - nodes[e.to].z,
      );
      this.parcels.push({
        edge,
        start: this.nextParcel,
        length: 1.4 + 2.4 * span,
      });
      this.nextParcel += (0.5 + this.random()) / this.traffic;
    }
    if (this.nextPulse === 0) this.nextPulse = f.now + 1;
    while (f.now >= this.nextPulse && this.builds.length) {
      const edge = this.builds[Math.floor(this.random() * this.builds.length)];
      this.pulses.push({ edge, start: this.nextPulse, length: 1.6 });
      this.nextPulse += 1.2 + 1.6 * this.random();
    }
    this.parcels = this.parcels.filter((p) => {
      if (f.now - p.start < p.length) return true;
      this.flash[edges[p.edge].to] = 1;
      return false;
    });
    this.pulses = this.pulses.filter((p) => f.now - p.start < p.length);
    // Arrival flashes die away over about a second.
    const dt = Math.min(0.1, Math.max(0, f.now - this.last));
    this.last = f.now;
    for (let i = 0; i < this.flash.length; i++)
      this.flash[i] = Math.max(0, this.flash[i] - dt * 1.4);
    shipped.forEach((s) => {
      if (s >= 1 && step === SHIP)
        this.flash[builderId] = Math.max(this.flash[builderId], 0.6);
    });
    resupplied.forEach((s, k) => {
      if (s >= 1)
        this.flash[edges[story.resupply[k]].to] = Math.max(
          this.flash[edges[story.resupply[k]].to],
          0.6,
        );
    });

    // ---- Links: faint, in a few batches by depth ------------------------------
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    const hidden = new Set<number>([
      ...story.follow,
      ...Object.values(story.supply),
      ...story.copy,
      ...story.resupply,
    ]);
    for (const kind of ["supply", "build"] as const) {
      ctx.setLineDash(kind === "build" ? [2, 4] : []);
      for (let bin = 0; bin < 3; bin++) {
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (e.kind !== kind || hidden.has(i)) continue;
          const d = (this.depth[e.from] + this.depth[e.to]) / 2;
          const b = Math.min(2, Math.floor(((d - (DISTANCE - 1)) / 2) * 3));
          if (b !== bin) continue;
          this.arc(i);
          any = true;
        }
        if (!any) continue;
        const depthAlpha = 1 - 0.28 * bin;
        ctx.strokeStyle = `rgb(${INK} / ${(kind === "supply" ? 0.085 : 0.07) * depthAlpha})`;
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Builds lighting up, now and then, as someone copies a project.
    for (const p of this.pulses) {
      const k = (f.now - p.start) / p.length;
      ctx.beginPath();
      this.arc(p.edge);
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = `rgb(${INK} / ${0.32 * Math.sin(k * Math.PI)})`;
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // The hovered node's links, all of them.
    if (f.hover !== null) {
      ctx.beginPath();
      for (const i of this.touching[f.hover]) this.arc(i);
      ctx.strokeStyle = `rgb(${INK} / 0.5)`;
      ctx.stroke();
    }

    // ---- The story's links ---------------------------------------------------
    const strong = (
      i: number,
      drawn: number,
      alpha: number,
      dashed = false,
      from = 0,
    ) => {
      if (drawn <= 0 || alpha <= 0) return;
      ctx.beginPath();
      this.arc(i, from, from + (1 - from) * drawn);
      ctx.setLineDash(dashed ? [3, 4] : []);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = `rgb(${INK} / ${alpha})`;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
    };
    story.follow.forEach((i, k) =>
      strong(i, follow[k], (step === PUBLISH ? 0.7 : 0.32) * lit, true),
    );
    storeNames.forEach((name, k) =>
      strong(
        story.supply[name],
        supplyDrawn[k],
        (step >= SPREAD ? 0.3 : 0.75) * lit,
      ),
    );
    story.copy.forEach((i, k) => strong(i, copied[k], 0.7 * lit, true));
    story.resupply.forEach((i, k) =>
      strong(i, Math.min(1, resupplied[k] * 3), 0.45 * lit),
    );

    // ---- Parcels ----------------------------------------------------------------
    const parcel = (i: number, t: number, alpha: number, size = 1) => {
      if (t <= 0 || t >= 1 || alpha <= 0) return;
      const tail = Math.max(0, t - 0.16);
      const [hx, hy] = this.along(i, t);
      const [tx, ty] = this.along(i, tail);
      const grad = ctx.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0, `rgb(${INK} / 0)`);
      grad.addColorStop(1, `rgb(${INK} / ${0.85 * alpha})`);
      ctx.beginPath();
      this.arc(i, tail, t);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 * size;
      ctx.stroke();
      ctx.lineWidth = 1;
      this.stamp(hx, hy, 16 * size, 0.9 * alpha);
    };
    for (const p of this.parcels) {
      const e = edges[p.edge];
      const d = (this.depth[e.from] + this.depth[e.to]) / 2;
      parcel(p.edge, (f.now - p.start) / p.length, 0.75 * this.fade(d));
    }
    story.resupply.forEach((i, k) => parcel(i, resupplied[k], lit));

    // ---- Waves, where a release goes out -------------------------------------------
    const wave = (node: number, t0: number, alpha: number) => {
      for (let w = 0; w < 2; w++) {
        const k = (t0 - w * 0.8) / 1.8;
        if (k <= 0 || k >= 1) continue;
        const r = (0.05 + 0.22 * k) * (this.focal / this.depth[node]);
        ctx.beginPath();
        ctx.ellipse(
          this.sx[node],
          this.sy[node],
          r,
          r * Math.sin(pitch) * 1.1,
          0,
          0,
          TAU,
        );
        ctx.strokeStyle = `rgb(${INK} / ${0.55 * (1 - k) * alpha})`;
        ctx.stroke();
      }
    };
    if (step === PUBLISH) wave(makerId, t - 0.1, 1);
    if (step === SPREAD) wave(builderId, t - 0.1, lit);

    // ---- Nodes ----------------------------------------------------------------------
    const near = new Set<number>(
      f.hover !== null
        ? this.touching[f.hover].flatMap((i) => [edges[i].from, edges[i].to])
        : [],
    );
    for (let bin = 0; bin < 4; bin++) {
      const rings = new Path2D();
      const squares = new Path2D();
      for (let i = 0; i < nodes.length; i++) {
        const d = this.depth[i];
        const b = Math.min(3, Math.floor(((d - (DISTANCE - 1)) / 2) * 4));
        if (b !== bin) continue;
        const s = DISTANCE / d;
        if (nodes[i].kind === "builder") {
          const r = 2.2 * s;
          rings.moveTo(this.sx[i] + r, this.sy[i]);
          rings.arc(this.sx[i], this.sy[i], r, 0, TAU);
        } else {
          const h = 2.5 * s;
          squares.rect(this.sx[i] - h, this.sy[i] - h, h * 2, h * 2);
        }
      }
      const a = 1 - 0.22 * bin;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgb(${INK} / ${0.55 * a})`;
      ctx.stroke(rings);
      ctx.fillStyle = `rgb(${INK} / ${0.8 * a})`;
      ctx.fill(squares);
    }

    // Bright nodes on top: the cast, the hovered and its neighbours, and
    // any that something just arrived at.
    const bright = (i: number, alpha: number, glow: number) => {
      const s = DISTANCE / this.depth[i];
      const pulse = 1 + 0.6 * this.flash[i];
      this.stamp(this.sx[i], this.sy[i], 34 * s * pulse, glow);
      ctx.globalAlpha = Math.min(1, alpha);
      if (nodes[i].kind === "builder") {
        ctx.beginPath();
        ctx.arc(this.sx[i], this.sy[i], 2.8 * s * pulse, 0, TAU);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgb(${INK})`;
        ctx.stroke();
        ctx.lineWidth = 1;
      } else {
        const h = 3.1 * s;
        ctx.fillStyle = `rgb(${INK})`;
        ctx.fillRect(this.sx[i] - h, this.sy[i] - h, h * 2, h * 2);
      }
      ctx.globalAlpha = 1;
    };
    for (let i = 0; i < nodes.length; i++) {
      if (this.flash[i] > 0)
        bright(i, 0.6 + this.flash[i], 0.6 * this.flash[i]);
    }
    for (const i of near) bright(i, 0.9, 0.25);
    const storeIds = storeNames.map((n) => cast[n]);
    bright(makerId, 1, step === PUBLISH ? 0.7 : 0.25);
    bright(builderId, 1, step >= CHECK ? 0.6 * lit + 0.2 : 0.2);
    storeIds.forEach((i) =>
      bright(i, 1, step >= FIND && step <= SHIP ? 0.6 : 0.2),
    );

    // The story's own parcels, larger, on top of everything.
    storeNames.forEach((name, k) =>
      parcel(story.supply[name], shipped[k], 1, 1.5),
    );

    // ---- What the page pins its words to ------------------------------------------
    const anchors: Anchors = { cast: {}, riders: {} };
    for (const [name, i] of Object.entries(cast))
      anchors.cast[name] = { x: this.sx[i], y: this.sy[i], on: 1 };
    storeNames.forEach((name, k) => {
      const i = story.supply[name];
      const [x, y] = this.along(i, Math.min(1, shipped[k]));
      const on =
        step === FIND
          ? ramp(t, 0.8 + k * 0.2, 0.5)
          : step === SHIP && shipped[k] < 1
            ? 1
            : 0;
      anchors.riders[name] = { x, y, on };
    });
    return anchors;
  }
}
