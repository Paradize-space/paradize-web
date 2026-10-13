"use client";

import dynamic from "next/dynamic";

import { TRACK_VH } from "./timeline";

/**
 * The film, fetched after the title screen. three.js is the heaviest
 * thing on the page and nothing above the fold needs it, so it is split
 * out and loaded on the client. The placeholder holds the same tall,
 * dark track, so nothing below it moves when the film arrives.
 */
const Film = dynamic(() => import("./film").then((m) => m.Film), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: `${TRACK_VH}vh`, background: "#010101" }}
      aria-hidden="true"
    />
  ),
});

/**
 * The wrapper carries the "How it works" anchor and exists from the
 * first paint, so the header's section tracking and the floating
 * waitlist card can find it before the film itself has loaded.
 */
export function FilmLazy() {
  return (
    <div id="route" data-quiet>
      <Film />
    </div>
  );
}
