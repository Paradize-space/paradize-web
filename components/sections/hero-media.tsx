"use client";

import { useEffect, useRef, useState } from "react";

import { heroVideo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * The live layer on the title screen.
 *
 * The reference runs looping muted video behind its hero, and that is
 * most of what makes it feel alive rather than printed. This is the same
 * move: a slow lateral drift across a dark board. The still underneath
 * is this clip's own first frame, so the handoff is invisible — the
 * picture simply starts moving.
 *
 * It is layered ON TOP of the poster image rather than replacing it, for
 * three reasons:
 *   · the image stays the LCP element, so the largest paint is a 200 KB
 *     JPEG and not a 5.6 MB video
 *   · if the video never arrives — blocked, slow, codec refused — the
 *     hero is simply the photograph, which is what it was before
 *   · the crossfade in means no black frame and no pop
 *
 * It does not load at all when the visitor has asked for reduced motion,
 * or on narrow viewports, where 5.6 MB is somebody's mobile data for a
 * background that is 60% hidden behind a scrim.
 */
export function HeroMedia() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [wanted, setWanted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");

    const decide = () => setWanted(!reduced.matches && wide.matches);
    decide();

    reduced.addEventListener("change", decide);
    wide.addEventListener("change", decide);
    return () => {
      reduced.removeEventListener("change", decide);
      wide.removeEventListener("change", decide);
    };
  }, []);

  // Autoplay can still be refused even when muted. If the promise
  // rejects, leave the poster showing rather than a frozen first frame.
  useEffect(() => {
    const video = ref.current;
    if (!wanted || !video) return;

    const start = async () => {
      try {
        await video.play();
        setReady(true);
      } catch {
        setReady(false);
      }
    };

    if (video.readyState >= 3) void start();
    else video.addEventListener("canplay", start, { once: true });

    return () => video.removeEventListener("canplay", start);
  }, [wanted]);

  if (!wanted) return null;

  return (
    <video
      ref={ref}
      // The clip has no audio track, but muted + playsInline is what
      // actually permits autoplay across browsers.
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      className={cn(
        // Fully opaque once up, so it occludes the still completely —
        // the dimming lives on the parent, not here. The fade is
        // short and only really covers the small colour difference
        // between a decoded JPEG and a decoded video frame; the poster
        // is this clip's frame zero, so there is no change of subject.
        "photo-hero absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      <source src={heroVideo.src} type="video/mp4" />
    </video>
  );
}
