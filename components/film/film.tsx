"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";

import { latest, macropad } from "@/lib/data/macropad";

import { detectTier } from "./quality";
import { sceneCopy } from "./scenes";
import { Studio } from "./scene/studio";
import {
  approach,
  chapters as chapterNames,
  initialPose,
  initialShot,
  sample,
  scenes,
  TRACK_VH,
  type Pose,
  type Shot,
} from "./timeline";
import s from "./film.module.css";
import l from "./scene/labels.module.css";

/**
 * The film: one sample keypad followed through Paradize in a single
 * continuous shot, below the title screen.
 *
 * A tall track pins a stage to the screen and the scroll position is
 * the playhead. The way in is a match cut: the title screen ends on
 * footage of a circuit board, and the film opens close on the keypad's
 * own bare board, in the dark, as the lamp over the bench comes up.
 * The camera pulls back while the rest of the keypad lands on it.
 *
 * Nothing renders unless the film is on screen and the scroll moved.
 */

type Dom = {
  track: MutableRefObject<HTMLElement | null>;
  dusk: MutableRefObject<HTMLDivElement | null>;
  panels: MutableRefObject<(HTMLDivElement | null)[]>;
  chapters: MutableRefObject<(HTMLLIElement | null)[]>;
};

const clamp = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** How long a passage of copy takes to fade, in progress. */
const FADE = 0.03;

function Director({
  dom,
  pose,
  shot,
}: {
  dom: Dom;
  pose: MutableRefObject<Pose>;
  shot: MutableRefObject<Shot>;
}) {
  const invalidate = useThree((st) => st.invalidate);

  // Everything happens in update(): it reads the scroll position against
  // measurements cached on layout changes, writes the pose and the shot,
  // updates the DOM, and only then asks for a frame. Doing it here rather
  // than inside the render loop means the frame that draws always draws
  // the position that asked for it (with on-demand rendering there is no
  // following frame to catch up in).
  useEffect(() => {
    const track = dom.track.current;
    if (!track) return;
    const metrics = { top: 0, length: 1, visible: false };
    const last: Record<string, string> = {};

    /** Write a style only when it changed, to keep layout work minimal. */
    const set = (
      key: string,
      el: HTMLElement | null | undefined,
      prop: string,
      value: string,
    ) => {
      if (!el || last[key] === value) return;
      last[key] = value;
      el.style.setProperty(prop, value);
    };

    const update = () => {
      const rectTop = metrics.top - window.scrollY;
      const h = window.innerHeight;
      const p = clamp(-rectTop / metrics.length);
      // 0 while the film's top edge is at the bottom of the screen, 1 once
      // the stage has pinned: the way in.
      const enter = clamp((h - rectTop) / h);

      sample(p, pose.current, shot.current);
      approach(shot.current, enter);

      // The lamp comes up over the last two thirds of the way in.
      set(
        "dusk",
        dom.dusk.current,
        "opacity",
        (1 - smooth(clamp((enter - 0.3) / 0.7))).toFixed(3),
      );

      let current = 0;
      scenes.forEach((scene, i) => {
        // The first passage is already up when the stage pins; it
        // fades in with the light rather than with the scroll.
        const fadeIn =
          i === 0 ? clamp((enter - 0.75) / 0.25) : (p - scene.from) / FADE;
        const o = clamp(Math.min(fadeIn, (scene.to - p) / FADE));
        const el = dom.panels.current[i];
        set(`o${i}`, el, "opacity", o.toFixed(3));
        set(
          `t${i}`,
          el,
          "transform",
          `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`,
        );
        set(`v${i}`, el, "visibility", o > 0.001 ? "visible" : "hidden");
        if (p >= scene.from - 0.02) current = i;
      });
      const chapter = scenes[current].chapter;
      dom.chapters.current.forEach((li, i) =>
        set(`c${i}`, li, "--on", i === chapter ? "1" : "0"),
      );

      // The build card follows the build dial.
      const done = pose.current.build * latest.steps.length;
      const build = dom.panels.current[scenes.length - 1];
      if (build && last.build !== done.toFixed(2)) {
        last.build = done.toFixed(2);
        build.querySelectorAll<HTMLElement>("[data-step]").forEach((li) => {
          li.dataset.done = Number(li.dataset.step) < done - 0.02 ? "1" : "0";
        });
        const count = build.querySelector<HTMLElement>("[data-build-count]");
        if (count)
          count.textContent = `${Math.min(latest.steps.length, Math.floor(done + 0.02))} / ${latest.steps.length}`;
        const bar = build.querySelector<HTMLElement>("[data-build-bar]");
        if (bar)
          bar.style.transform = `scaleX(${pose.current.build.toFixed(3)})`;
      }

      invalidate();
    };

    const measure = () => {
      metrics.top = track.getBoundingClientRect().top + window.scrollY;
      metrics.length = Math.max(1, track.offsetHeight - window.innerHeight);
      update();
    };
    const onScroll = () => {
      if (metrics.visible) update();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        metrics.visible = entry.isIntersecting;
        if (entry.isIntersecting) measure();
      },
      { rootMargin: "50% 0px" },
    );
    const ro = new ResizeObserver(measure);
    io.observe(track);
    ro.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [dom, pose, shot, invalidate]);

  return null;
}

export function Film() {
  const tier = useMemo(() => detectTier(), []);
  const pose = useRef<Pose>(initialPose());
  const shot = useRef<Shot>(initialShot());
  const track = useRef<HTMLElement | null>(null);
  const dusk = useRef<HTMLDivElement | null>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const chapters = useRef<(HTMLLIElement | null)[]>([]);
  // Handed to the director as one bundle; built once, holding the refs
  // themselves (never their .current), so it is stable across renders.
  const dom = useMemo<Dom>(() => ({ track, dusk, panels, chapters }), []);

  const labels = {
    case: <span className={l.label}>Case · aluminium</span>,
    board: <span className={l.label}>Board · controller</span>,
    plate: <span className={l.label}>Switch plate · brass</span>,
    switches: <span className={l.label}>Switches ×9</span>,
    caps: <span className={l.label}>Keycaps ×9</span>,
    knob: <span className={l.labelRight}>Knob + encoder</span>,
    kit: <span className={l.kitTag}>Missing · in the kit</span>,
  };

  return (
    <section
      ref={track}
      className={s.track}
      style={{ height: `${TRACK_VH}vh` }}
      aria-label={`How Paradize works, following ${macropad.name}, a sample project`}
    >
      <div className={s.stage}>
        <div className={s.frame}>
          <Studio
            tier={tier}
            pose={pose}
            shot={shot}
            labels={labels}
            className={s.canvas}
          >
            <Director dom={dom} pose={pose} shot={shot} />
          </Studio>

          <div className={s.copy}>
            {scenes.map((scene, i) => {
              const copy = sceneCopy[scene.id];
              const Heading = i === 0 ? "h2" : "h3";
              return (
                <div
                  key={scene.id}
                  ref={(el) => {
                    panels.current[i] = el;
                  }}
                  className={s.panel}
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <p className={s.kicker}>{copy.kicker}</p>
                  <Heading className={s.title}>{copy.title}</Heading>
                  <p className={s.body}>{copy.body}</p>
                  {copy.card}
                </div>
              );
            })}
          </div>

          <div ref={dusk} className={s.dusk} aria-hidden="true" />
        </div>

        <ol className={s.chapters} aria-hidden="true">
          {chapterNames.map((name, i) => (
            <li
              key={name}
              ref={(el) => {
                chapters.current[i] = el;
              }}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {name}
            </li>
          ))}
        </ol>
        <p className={s.sample}>Sample project · not a live account</p>
      </div>
    </section>
  );
}
