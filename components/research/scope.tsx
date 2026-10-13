"use client";

import { useEffect, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";

import s from "./scope.module.css";

/**
 * The research page's instrument: an oscilloscope, drawing on black.
 *
 * It has four figures, each a different kind of curve: a Lissajous
 * (two sine waves, one across and one up), a harmonograph (two damped
 * pendulums, spiralling in), a rose (a polar curve) and a spirograph (a
 * wheel rolling inside a ring). The pointer tunes the figure (across
 * for the first setting, up and down for the second), the two faders
 * do the same by touch or keyboard, and a click on the screen moves to
 * the next figure, morphing the beam from one into the other. Left
 * alone, the tuning wanders and the figures take turns.
 *
 * Drawn on a plain 2D canvas with phosphor persistence: each frame the
 * screen is dimmed a little and the new trace is added on top, so a
 * moving figure leaves a short afterglow. The beam is three strokes
 * (a wide faint bloom, a softer halo and the bright core), brightening
 * towards its head. It runs only while on screen and while the tab is
 * visible; under reduced motion it draws one still figure.
 */

const TAU = Math.PI * 2;
/** Points along the trace, and the pieces it is drawn in, tail to head. */
const POINTS = 1500;
const PIECES = 16;
const clamp = (t: number) => Math.min(1, Math.max(0, t));
/** How long a figure takes to morph into the next, in seconds. */
const MORPH = 1.2;
/** Left alone, how long each figure stays, in milliseconds. */
const TURN = 14000;

type Figure = {
  name: string;
  /** What the two settings do here. */
  a: string;
  b: string;
  /** The point at k (0 to 1 along the trace) for settings u and v. */
  at: (
    k: number,
    u: number,
    v: number,
    drift: number,
    out: Float32Array,
  ) => void;
  readA: (u: number) => string;
  readB: (v: number) => string;
};

const deg = (turns: number) =>
  `${String(Math.round(turns * 180)).padStart(3, "0")}°`;

const FIGURES: Figure[] = [
  {
    name: "Lissajous",
    a: "Ratio",
    b: "Phase",
    at: (k, u, v, d, o) => {
      const t = k * TAU * 3;
      o[0] = Math.sin(t + v * Math.PI + d);
      o[1] = Math.sin((1 + u * 3) * t);
    },
    readA: (u) => (1 + u * 3).toFixed(2),
    readB: (v) => deg(v),
  },
  {
    name: "Harmonograph",
    a: "Ratio",
    b: "Decay",
    at: (k, u, v, d, o) => {
      const t = k * TAU * 18;
      const r = 1 + u * 2;
      const env = Math.exp(-(0.4 + 3 * v) * k);
      o[0] =
        (env * (Math.sin(t + d) + 0.5 * Math.sin(r * t * 1.002 + 1.1))) / 1.5;
      o[1] =
        (env * (Math.sin(r * t + 0.4) + 0.5 * Math.sin(t * 1.003 + d * 0.7))) /
        1.5;
    },
    readA: (u) => (1 + u * 2).toFixed(2),
    readB: (v) => (0.4 + 3 * v).toFixed(2),
  },
  {
    name: "Rose",
    a: "Petals",
    b: "Turn",
    at: (k, u, v, d, o) => {
      const th = k * TAU * 6;
      const r = Math.cos((2 + u * 5) * th);
      const a = th + v * Math.PI + d * 0.3;
      o[0] = r * Math.cos(a);
      o[1] = r * Math.sin(a);
    },
    readA: (u) => (2 + u * 5).toFixed(2),
    readB: (v) => deg(v),
  },
  {
    name: "Spirograph",
    a: "Wheel",
    b: "Pen",
    at: (k, u, v, d, o) => {
      const t = k * TAU * 10;
      const r = 0.15 + u * 0.6;
      const pen = (0.3 + v * 0.9) * r * 1.5;
      const q = ((1 - r) / r) * t;
      const x = (1 - r) * Math.cos(t) + pen * Math.cos(q);
      const y = (1 - r) * Math.sin(t) - pen * Math.sin(q);
      const c = Math.cos(d * 0.3);
      const sn = Math.sin(d * 0.3);
      o[0] = x * c - y * sn;
      o[1] = x * sn + y * c;
    },
    readA: (u) => (0.15 + u * 0.6).toFixed(2),
    readB: (v) => (0.3 + v * 0.9).toFixed(2),
  },
];

export function Scope({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLSpanElement>(null);
  /** The tuning, 0 to 1 each way: shared by the faders and the loop. */
  const tune = useRef({ u: 0.15, v: 0.3, tu: 0.15, tv: 0.3, touched: 0 });
  /** The figure on screen, and the one it is morphing from. */
  const figure = useRef({ now: 0, from: 0, since: -1e9 });
  /** Draws one still frame, under reduced motion; set by the effect. */
  const still = useRef<(() => void) | null>(null);
  const [faders, setFaders] = useState<[number, number]>([0.15, 0.3]);
  const [mode, setMode] = useState(0);

  /** Move to a figure, from wherever the beam is. */
  const show = (next: number) => {
    const f = figure.current;
    if (next === f.now) return;
    f.from = f.now;
    f.now = next;
    f.since = performance.now();
    setMode(next);
    still.current?.();
  };

  useEffect(() => {
    const el = host.current;
    const cv = canvas.current;
    const g = cv?.getContext("2d");
    if (!el || !cv || !g) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    const size = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Wide: right of the words, clear of the readouts. Narrow: the
      // screen is its own block, between the readout row at its top
      // and the modes and faders at its foot.
      if (w >= 1024) {
        cx = w * 0.6;
        cy = h * 0.5;
        R = Math.min(w * 0.22, h * 0.34);
      } else {
        const top = 120;
        const bottom = h - 150;
        cx = w * 0.5;
        cy = (top + bottom) / 2;
        R = Math.min(w * 0.4, ((bottom - top) / 2) * 0.94);
      }
      g.fillStyle = "#010101";
      g.fillRect(0, 0, w, h);
    };

    const knob = tune.current;
    const fig = figure.current;
    let drift = 0;
    const px = new Float32Array(POINTS + 1);
    const py = new Float32Array(POINTS + 1);
    const p = new Float32Array(2);
    const q = new Float32Array(2);

    /** Work out the trace: the figure, mid-morph if one is under way. */
    const place = (now: number, u: number, v: number) => {
      const mix = clamp((now - fig.since) / (MORPH * 1000));
      const k = mix * mix * (3 - 2 * mix);
      const to = FIGURES[fig.now];
      const from = FIGURES[fig.from];
      let max = 0;
      for (let i = 0; i <= POINTS; i++) {
        const t = i / POINTS;
        to.at(t, u, v, drift, p);
        if (k < 1) {
          from.at(t, u, v, drift, q);
          p[0] = q[0] + (p[0] - q[0]) * k;
          p[1] = q[1] + (p[1] - q[1]) * k;
        }
        px[i] = p[0];
        py[i] = p[1];
        max = Math.max(max, Math.abs(p[0]), Math.abs(p[1]));
      }
      // Every figure fills the same screen.
      const scale = (R * 0.92) / Math.max(max, 1e-3);
      for (let i = 0; i <= POINTS; i++) {
        px[i] = cx + px[i] * scale;
        py[i] = cy - py[i] * scale;
      }
    };

    /** Draw the trace: tail to head, each piece brighter than the last. */
    const trace = (time: number) => {
      const per = POINTS / PIECES;
      for (let k = 0; k < PIECES; k++) {
        const f = Math.pow((k + 1) / PIECES, 1.4);
        const from = Math.floor(k * per);
        const to = Math.min(POINTS, Math.ceil((k + 1) * per));
        g.beginPath();
        g.moveTo(px[from], py[from]);
        // Hum on the line: a slow ripple, too small to read as noise.
        for (let i = from + 1; i <= to; i++)
          g.lineTo(px[i], py[i] + Math.sin(i * 0.37 + time * 11) * 0.25);
        // Bloom, halo, core.
        g.strokeStyle = `rgba(236,232,222,${(0.035 * f).toFixed(3)})`;
        g.lineWidth = 5;
        g.stroke();
        g.strokeStyle = `rgba(240,236,226,${(0.1 * f).toFixed(3)})`;
        g.lineWidth = 2.6;
        g.stroke();
        g.strokeStyle = `rgba(246,243,236,${(0.62 * f).toFixed(3)})`;
        g.lineWidth = 1.05;
        g.stroke();
      }
      // The spot itself.
      const hx = px[POINTS];
      const hy = py[POINTS];
      const spot = g.createRadialGradient(hx, hy, 0, hx, hy, 9);
      spot.addColorStop(0, "rgba(250,248,242,0.9)");
      spot.addColorStop(1, "rgba(250,248,242,0)");
      g.fillStyle = spot;
      g.fillRect(hx - 9, hy - 9, 18, 18);
    };

    let shown = { a: "", b: "" };
    const read = () => {
      const f = FIGURES[fig.now];
      const next = { a: f.readA(knob.u), b: f.readB(knob.v) };
      if (aRef.current && next.a !== shown.a) aRef.current.textContent = next.a;
      if (bRef.current && next.b !== shown.b) bRef.current.textContent = next.b;
      shown = next;
    };

    size();

    if (calm) {
      // One still figure, built up the way a long exposure would be;
      // a click or a mode button draws the next.
      const draw = () => {
        fig.since = -1e9;
        size();
        place(0, knob.u, knob.v);
        g.globalCompositeOperation = "lighter";
        for (let i = 0; i < 3; i++) trace(0);
        g.globalCompositeOperation = "source-over";
        read();
      };
      still.current = draw;
      draw();
      const ro = new ResizeObserver(draw);
      ro.observe(el);
      return () => {
        ro.disconnect();
        still.current = null;
      };
    }

    let frame = 0;
    let pushed = 0;
    let running = false;
    let last = performance.now();
    let turnAt = performance.now() + TURN;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;

      // Left alone, the tuning wanders and the figures take turns; a
      // pointer takes over for a while after it moves.
      if (now - knob.touched > 6000) {
        const k = time * 0.11;
        knob.tu = clamp(0.35 + 0.3 * Math.sin(k) + 0.08 * Math.sin(k * 2.7));
        knob.tv = clamp(0.5 + 0.38 * Math.sin(k * 0.83 + 1.1));
        if (now > turnAt) {
          turnAt = now + TURN;
          show((fig.now + 1) % FIGURES.length);
        }
      } else turnAt = now + TURN;
      const ease = 1 - Math.pow(0.004, dt);
      knob.u += (knob.tu - knob.u) * ease;
      knob.v += (knob.tv - knob.v) * ease;
      // The faders follow the tuning a few times a second, except while
      // someone has hold of one.
      if (now - knob.touched > 400 && now - pushed > 90) {
        pushed = now;
        setFaders((f) =>
          Math.abs(f[0] - knob.u) > 0.003 || Math.abs(f[1] - knob.v) > 0.003
            ? [knob.u, knob.v]
            : f,
        );
      }
      drift += dt * 0.6;

      // Persistence: dim what is there, then add the new trace.
      g.globalCompositeOperation = "source-over";
      g.fillStyle = "rgba(1,1,1,0.2)";
      g.fillRect(0, 0, w, h);
      // Dimming by a fraction stalls a few levels above black, which
      // leaves a faint box where the beam has been; taking two levels
      // off as well lets it fade all the way out.
      g.globalCompositeOperation = "difference";
      g.fillStyle = "rgb(2,2,2)";
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      place(now, knob.u, knob.v);
      trace(time);
      g.globalCompositeOperation = "source-over";

      read();
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    // A mouse or pen tunes by moving over the page. Touch has the
    // faders, so a finger can scroll past without retuning.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if ((e.target as Element | null)?.closest("[data-panel]")) return;
      const r = el.getBoundingClientRect();
      knob.tu = clamp((e.clientX - r.left) / r.width);
      knob.tv = clamp(1 - (e.clientY - r.top) / r.height);
      knob.touched = performance.now();
    };
    const section = el.closest("section") ?? el;
    section.addEventListener("pointermove", onMove);

    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    io.observe(el);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(size);
    ro.observe(el);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      section.removeEventListener("pointermove", onMove);
    };
  }, []);

  /** A fader moved: it sets the target, and holds off the wander. */
  const move = (axis: 0 | 1, value: number | readonly number[]) => {
    const v = typeof value === "number" ? value : value[0];
    const knob = tune.current;
    if (axis === 0) knob.tu = v;
    else knob.tv = v;
    knob.touched = performance.now();
    setFaders((f) => (axis === 0 ? [v, f[1]] : [f[0], v]));
    still.current?.();
  };

  const current = FIGURES[mode];

  return (
    <div
      ref={host}
      className={`${s.scope} ${className ?? ""}`}
      // A click on the screen (not on the panel) moves to the next figure.
      onClick={(e) => {
        if ((e.target as Element).closest("[data-panel]")) return;
        tune.current.touched = performance.now();
        show((figure.current.now + 1) % FIGURES.length);
      }}
    >
      <canvas ref={canvas} aria-hidden="true" className={s.canvas} />
      <div data-panel className={s.panel}>
        <dl aria-hidden="true" className={s.readout}>
          <div>
            <dt>Mode</dt>
            <dd>{current.name}</dd>
          </div>
          <div>
            <dt>{current.a}</dt>
            <dd>
              <span ref={aRef} />
            </dd>
          </div>
          <div>
            <dt>{current.b}</dt>
            <dd>
              <span ref={bRef} />
            </dd>
          </div>
        </dl>

        <div className={s.controls}>
          <div className={s.modes} role="group" aria-label="Figure">
            {FIGURES.map((f, i) => (
              <button
                key={f.name}
                type="button"
                aria-pressed={i === mode}
                onClick={() => {
                  tune.current.touched = performance.now();
                  show(i);
                }}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className={s.faders}>
            <label className={s.fader}>
              <span>{current.a}</span>
              <Slider
                min={0}
                max={1}
                step={0.001}
                value={[faders[0]]}
                onValueChange={(v) => move(0, v)}
                aria-label={current.a}
              />
            </label>
            <label className={s.fader}>
              <span>{current.b}</span>
              <Slider
                min={0}
                max={1}
                step={0.001}
                value={[faders[1]]}
                onValueChange={(v) => move(1, v)}
                aria-label={current.b}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
