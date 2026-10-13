"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { ActionArrow } from "@/components/controls/action-link";
import { WaitlistButton } from "@/components/controls/waitlist";
import {
  builder,
  missing,
  parts,
  project,
  stores,
} from "@/lib/data/market-network";

import { makeGraph, type Graph } from "./network/graph";
import { Network, type Anchors } from "./network/render";
import { at, indexOf, LOOP, starts, steps, type Step } from "./network/story";
import s from "./market-network.module.css";

/**
 * The marketplace page: the market as a network, alive.
 *
 * Builders (rings) and stores (squares) over a dark disc, joined by
 * arcs. Parts travel the arcs as small lights, all the time, all over;
 * now and then a dotted link lights up where someone builds from
 * someone else's project. Over that runs one story with names: @mira
 * publishes a release, @theo's shelf already has five of its seven
 * parts, @kai and @lumen send the other two (their photographs ride the
 * arcs), and then others build from Theo's version.
 *
 * The network is drawn on a 2D canvas (see network/render.ts); names
 * and photographs are HTML pinned to it. It runs only on
 * screen, the bar pauses it or jumps to a step, hovering a node shows
 * everything it is joined to, and under reduced motion it holds still on
 * the step that shows the most.
 */

const maker = project.maker;
const [kai, lumen] = stores;

const captions: Record<Step, string> = {
  publish: `@${maker} publishes ${project.name} ${project.release}. Builders start on it`,
  check: `@${builder} has ${parts.length - missing.length} of its ${parts.length} parts already`,
  find: `@${kai.handle} and @${lumen.handle} stock the other ${missing.length}`,
  ship: `Both are on their way to @${builder}`,
  spread: `Others build from @${builder}'s version. Their parts ship too`,
};

const CHECK = indexOf("check");
const FIND = indexOf("find");
const SHIP = indexOf("ship");
/** What reduced motion holds on: the links found, the photographs out. */
const STILL_STEP = FIND;

const cast = { maker, builder, stores: stores.map((x) => x.handle) };
const roles: Record<string, string> = {
  [maker]: "builder",
  [builder]: "builder",
  ...Object.fromEntries(
    stores.map((x) => [x.handle, `store · ${x.sells.toLowerCase()}`]),
  ),
};

/** A bigger network where there is room for it. */
const graphFor = (wide: boolean): Graph =>
  wide
    ? makeGraph({ builders: 78, stores: 13, cast })
    : makeGraph({ builders: 46, stores: 9, cast });

/* ---- Reduced motion, read without an effect ---------------------------- */

const STILL = "(prefers-reduced-motion: reduce)";
const watchStill = (change: () => void) => {
  const query = window.matchMedia(STILL);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};
const useStill = () =>
  useSyncExternalStore(
    watchStill,
    () => window.matchMedia(STILL).matches,
    () => false,
  );

/* ---- The scene --------------------------------------------------------- */

export function MarketNetwork() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLParagraphElement>(null);
  const bar = useRef<HTMLOListElement>(null);
  const pins = useRef<Record<string, HTMLElement | null>>({});
  const riders = useRef<Record<string, HTMLElement | null>>({});
  /** Seconds into the story's loop, and running seconds for the traffic. */
  const clock = useRef(0);
  const now = useRef(0);
  /** Draws one frame now, and starts or stops the frame loop; both set
   *  once the canvas is up. */
  const redraw = useRef<() => void>(() => {});
  const rerun = useRef<() => void>(() => {});

  const still = useStill();
  const [step, setStep] = useState(0);
  // Plays unless the viewer prefers less motion; either way the pause
  // button decides from the first press.
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !still;
  const live = useRef(playing);
  useEffect(() => {
    live.current = playing;
    rerun.current();
  }, [playing]);

  const paint = useCallback(() => {
    const { index, progress } = at(clock.current);
    setStep(index);
    bar.current?.style.setProperty("--p", progress.toFixed(3));
  }, []);

  // Wait on the step that shows the most until asked to play.
  useEffect(() => {
    if (!still || choice !== null) return;
    clock.current = starts[STILL_STEP] + 0.01;
    const frame = requestAnimationFrame(() => {
      paint();
      redraw.current();
    });
    return () => cancelAnimationFrame(frame);
  }, [still, choice, paint]);

  // The canvas: built once, sized with the stage, drawn every frame
  // while running and on demand while still.
  useEffect(() => {
    const el = root.current;
    const box = stage.current;
    const cv = canvas.current;
    if (!el || !box || !cv) return;

    let wide = window.matchMedia("(min-width: 64rem)").matches;
    let net = new Network(cv, graphFor(wide), wide ? 2.6 : 1.6);
    let width = 0;
    let height = 0;
    const tilt: [number, number] = [0, 0];
    const aim: [number, number] = [0, 0];
    let hover: number | null = null;

    const resize = () => {
      const r = box.getBoundingClientRect();
      width = r.width;
      height = r.height;
      const nowWide = window.matchMedia("(min-width: 64rem)").matches;
      if (nowWide !== wide) {
        wide = nowWide;
        net = new Network(cv, graphFor(wide), wide ? 2.6 : 1.6);
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      net.resize(
        width,
        height,
        dpr,
        wide
          ? {
              cx: width * 0.6,
              cy: height * 0.45,
              radius: Math.min(width * 0.34, height * 0.62),
              pitch: 0.5,
            }
          : // A phone is tall: look down more steeply, so the disc
            // fills the height, and let its sides run off the edges.
            {
              cx: width * 0.5,
              cy: height * 0.6,
              radius: Math.min(width * 0.6, height * 0.42),
              pitch: 0.85,
            },
      );
    };

    const place = (a: Anchors) => {
      for (const [name, p] of Object.entries(a.cast)) {
        const pin = pins.current[name];
        if (!pin) continue;
        pin.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
        // Near the right edge, the name goes on the node's left.
        const side = p.x > width - 150 ? "left" : "right";
        if (pin.dataset.side !== side) pin.dataset.side = side;
      }
      for (const [name, p] of Object.entries(a.riders)) {
        const rider = riders.current[name];
        if (!rider) continue;
        rider.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
        rider.style.opacity = p.on.toFixed(2);
      }
    };

    const frame = () => {
      const { index, time } = at(clock.current);
      // Still, each step shows as it ends, so a jump lands somewhere whole.
      const stepTime = live.current ? time : steps[index].length - 0.65;
      place(
        net.draw({
          now: now.current,
          step: index,
          stepTime,
          tilt,
          hover,
        }),
      );
    };
    redraw.current = frame;

    // Run while playing, on screen and in a visible tab.
    let visible = false;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 100) / 1000 : 0;
      last = t;
      if (live.current) {
        clock.current = (clock.current + dt) % LOOP;
        now.current += dt;
        paint();
      }
      // The pointer leans the disc a little; eased, so it drifts.
      tilt[0] += (aim[0] - tilt[0]) * Math.min(1, dt * 3);
      tilt[1] += (aim[1] - tilt[1]) * Math.min(1, dt * 3);
      frame();
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (visible && !document.hidden && live.current)
        raf = requestAnimationFrame(tick);
      else frame();
    };

    const ro = new ResizeObserver(() => {
      resize();
      frame();
    });
    ro.observe(box);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", run);
    rerun.current = run;

    // Hover a node to see everything it is joined to.
    const calm = window.matchMedia(STILL).matches;
    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (!calm) {
        aim[0] = (x / r.width) * 2 - 1;
        aim[1] = (y / r.height) * 2 - 1;
      }
      const next = net.pick(x, y);
      if (next !== hover) {
        hover = next;
        const t = tip.current;
        if (t) {
          if (hover === null) t.dataset.on = "false";
          else {
            const n = net.node(hover);
            t.textContent = n.name
              ? `@${n.name} · ${roles[n.name]}`
              : n.kind === "store"
                ? "A store"
                : "A builder";
            t.dataset.on = "true";
          }
        }
        if (!raf) frame();
      }
      if (hover !== null && tip.current) {
        const p = net.peekIndex(hover);
        tip.current.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      }
    };
    const leave = () => {
      aim[0] = aim[1] = 0;
      hover = null;
      if (tip.current) tip.current.dataset.on = "false";
      if (!raf) frame();
    };
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", run);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerleave", leave);
      redraw.current = () => {};
      rerun.current = () => {};
    };
  }, [paint]);

  const jump = (i: number) => {
    clock.current = starts[i] + 0.01;
    paint();
    redraw.current();
  };

  const id = steps[step].id;

  return (
    <section
      ref={root}
      data-step={id}
      data-playing={playing}
      // The words carry the waitlist here; the floating card steps aside.
      data-quiet
      className={s.screen}
      aria-label={`The marketplace, shown as an illustration with sample people and stores`}
    >
      {/* What the drawing shows, as text, for anyone who cannot see it:
          screen readers, and agents reading the page. */}
      <ol className="sr-only">
        {steps.map((st) => (
          <li key={st.id}>{captions[st.id]}</li>
        ))}
      </ol>

      <div ref={stage} className={s.stage} aria-hidden="true">
        <canvas ref={canvas} className={s.canvas} />

        {Object.keys(roles).map((name) => (
          <span
            key={name}
            ref={(el) => {
              pins.current[name] = el;
            }}
            className={s.pin}
            data-kind={name === maker || name === builder ? "builder" : "store"}
            data-on={
              (name === maker && step === 0) ||
              (name === builder && step >= CHECK) ||
              (name !== maker &&
                name !== builder &&
                step >= FIND &&
                step <= SHIP)
            }
          >
            <span>
              @{name}
              <em>{roles[name]}</em>
            </span>
          </span>
        ))}

        {stores.map((x) => (
          <span
            key={x.handle}
            ref={(el) => {
              riders.current[x.handle] = el;
            }}
            className={s.rider}
          >
            <span>
              <Image
                src={x.photo}
                alt=""
                width={640}
                height={480}
                sizes="4rem"
              />
            </span>
          </span>
        ))}

        <p ref={tip} className={s.tip} data-on="false" />
      </div>

      <div className={s.words}>
        <p className="mono text-dim">02 — Marketplace</p>
        <h1 className="text-heading mt-5">
          Stores and builders, wired together.
        </h1>
        <p className="text-lead text-mute mt-5 max-w-[38ch]">
          Every project on Paradize lists its parts, so stores can stock for the
          people building it. Your shelf is checked first, and only what is
          missing ships.
        </p>
        <WaitlistButton
          variant="action"
          size="action"
          interests={["marketplace"]}
          className="group/action mt-8 min-w-[15.625rem] justify-start"
        >
          <ActionArrow />
          Tell me when it opens
        </WaitlistButton>
        <p className="mono text-dim mt-6 text-balance">
          Built · switched off until there are real sellers
        </p>
        <p className="mono text-dim mt-2 text-balance">
          Sample people and stores · nothing is for sale
        </p>
      </div>

      <div className={s.bar}>
        <button
          type="button"
          onClick={() => setChoice(!playing)}
          className={s.pause}
          aria-label={playing ? "Pause the animation" : "Play the animation"}
        >
          {playing ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </button>
        <ol ref={bar} className={s.steps} aria-label="Steps">
          {steps.map((st, i) => (
            <li key={st.id}>
              <button
                type="button"
                onClick={() => jump(i)}
                data-state={i < step ? "past" : i === step ? "now" : "next"}
                aria-current={i === step ? "step" : undefined}
                aria-label={`${i + 1}. ${captions[st.id]}`}
              />
            </li>
          ))}
        </ol>
        <p className={s.caption} aria-hidden="true">
          <span>
            {String(step + 1).padStart(2, "0")} /{" "}
            {String(steps.length).padStart(2, "0")}
          </span>
          {captions[id]}
        </p>
      </div>

      <ul className={s.legend} aria-label="Key">
        <li>
          <i data-shape="ring" />
          Builder
        </li>
        <li>
          <i data-shape="square" />
          Store
        </li>
        <li>
          <i data-shape="arc" />
          Parts on the way
        </li>
        <li>
          <i data-shape="dots" />
          Built from another&rsquo;s project
        </li>
      </ul>
    </section>
  );
}
