"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Room left above a section for the fixed header, in pixels. */
const HEADER = 72;

/**
 * Smooth scrolling, from the `lenis` package.
 *
 * The reference site scrolls with noticeable inertia, which is what lets
 * its full-bleed photography read as one continuous pan rather than as a
 * series of jumps. This is that library rather than a hand-rolled
 * wheel-event handler.
 *
 * It stays off entirely when the visitor has asked for reduced motion —
 * hijacking the scroll is exactly the kind of thing that setting means.
 * Same-page anchor links are handled either way.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? null
      : new Lenis({
          duration: 1.1,
          // Lenis only handles the wheel; touch keeps the native
          // behaviour, which is smoother than anything JS can do on a
          // phone.
          smoothWheel: true,
          touchMultiplier: 1.6,
        });

    let frame = 0;
    if (lenis) {
      const raf = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    }

    // In-page anchors go through Lenis, or they fight it.
    //
    // The nav writes its landing-page links absolutely, as `/#top`, so
    // they work from every page; here they are recognised as same-page
    // jumps whenever we are already on that page. Links to another page
    // keep the normal navigation.
    //
    // The listener captures, so it runs before Next's Link: left to
    // Next, a link to the address you are already on (Platform, clicked
    // a second time) navigates nowhere and does not move.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) return;
      if (!url.hash) return;

      const target = document.getElementById(url.hash.slice(1));
      if (!target) return;

      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -HEADER });
      else
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - HEADER,
        });
      // Keep the address bar honest without triggering a jump.
      if (url.hash === window.location.hash)
        history.replaceState(null, "", url.hash);
      else history.pushState(null, "", url.hash);
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return null;
}
