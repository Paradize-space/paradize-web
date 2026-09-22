"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Beat, Mark } from "@/lib/data/demo-flow";

/**
 * The virtual camera over the preview window.
 *
 * The window is a fixed-size viewport with a content layer inside it
 * that gets translated and scaled. Transforms do not affect layout,
 * so the content sizes itself normally and the camera simply crops
 * whatever it pushes past the edges.
 *
 * Pulled out of the component because it is the one genuinely subtle
 * part: it is coordinate arithmetic with several hard-won rules in
 * it, and those rules were unreadable buried in three hundred lines
 * of JSX.
 */

export type MarkName = Exclude<Mark, null>;

const MARK_NAMES: MarkName[] = [
  "projectRow",
  "clone",
  "list",
  "shortfall",
  "search",
  "results",
  "add",
];

/** Attached in JSX as a plain ref callback. */
export type SetMark = (el: HTMLElement | null) => void;

export type Marks = {
  /** Read by the camera. */
  ref: Record<MarkName, { current: HTMLElement | null }>;
  /** Handed to the screens one at a time, each getting only its own. */
  set: Record<MarkName, SetMark>;
};

/**
 * Handles for the things the camera can aim at.
 *
 * Built once and never replaced, so the setters are stable and React
 * does not detach and reattach every mark on each render — which it
 * does if the callback identity changes.
 */
export function useMarks(): Marks {
  // A lazy useState initialiser rather than a ref: it runs exactly
  // once, and reading a ref during render is both flagged by the
  // hooks lint and a real hazard. The boxes inside are plain objects,
  // not React refs, so writing to them from a ref callback is fine.
  const [marks] = useState<Marks>(() => {
    const ref = {} as Marks["ref"];
    const set = {} as Marks["set"];
    for (const name of MARK_NAMES) {
      ref[name] = { current: null };
      set[name] = (el: HTMLElement | null) => {
        ref[name].current = el;
      };
    }
    return { ref, set };
  });
  return marks;
}

/**
 * Where an element sits inside the content layer, in LAYOUT pixels.
 *
 * getBoundingClientRect is no use here: the content is being scaled,
 * so it would report post-transform coordinates and the camera would
 * chase its own tail. Walking offsetParent gives the untransformed
 * position.
 */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export function useCamera(step: Beat, reduced: boolean, marks: Marks) {
  const viewRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [cam, setCam] = useState({ x: 0, y: 0, s: 1 });
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const { look, point, scale } = step;

  const place = useCallback(() => {
    const view = viewRef.current;
    const content = contentRef.current;
    if (!view || !content) return;

    const pointerAt = point ? marks.ref[point].current : null;
    if (pointerAt) {
      const p = offsetWithin(pointerAt, content);
      setCursor({ x: p.x + p.w * 0.5, y: p.y + p.h * 0.62 });
    }

    if (reduced) {
      setCam({ x: 0, y: 0, s: 1 });
      return;
    }

    const target = look ? marks.ref[look].current : null;
    if (!target) {
      setCam({ x: 0, y: 0, s: 1 });
      return;
    }

    const vw = view.clientWidth;
    const vh = view.clientHeight;

    // Ease the push-in on a narrow window. A 1.5x crop of a 390px
    // frame leaves almost nothing on screen either side of the
    // control, which stops reading as a camera move and starts
    // reading as a broken layout.
    const s = vw < 560 ? 1 + (scale - 1) * 0.45 : scale;
    const cw = content.offsetWidth;
    const ch = content.offsetHeight;
    const t = offsetWithin(target, content);

    const fx = t.x + t.w / 2;
    const fy = t.y + t.h / 2;

    // A target that already spans the window has no meaningful centre
    // to push towards, and centring one crops both edges evenly —
    // which eats the part names, since rows read from the left. Hold
    // the left edge for those and let the overflow fall off the
    // right. Beats that want a real push-in therefore name a NARROW
    // subject: pushing into a full-width row crops the very thing the
    // beat is about.
    const spansWidth = t.w > cw * 0.7;

    setCam({
      x: spansWidth ? 0 : clamp(vw / 2 - fx * s, Math.min(0, vw - cw * s), 0),
      y: clamp(vh / 2 - fy * s, Math.min(0, vh - ch * s), 0),
      s,
    });
  }, [look, marks, point, reduced, scale]);

  useEffect(() => {
    place();
  }, [place]);

  // The camera is computed from layout, so it has to be recomputed
  // when the layout changes underneath it.
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const view = viewRef.current;
    if (!view) return;
    const ro = new ResizeObserver(() => place());
    ro.observe(view);
    return () => ro.disconnect();
  }, [place]);

  return { viewRef, contentRef, cam, cursor };
}
