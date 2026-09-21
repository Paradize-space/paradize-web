"use client";

import Lenis from "lenis";
import { useEffect } from "react";

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
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Lenis only handles the wheel; touch keeps the native behaviour,
      // which is smoother than anything JS can do on a phone.
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // In-page anchors have to go through Lenis or they fight it.
    //
    // Matching on `href^="#"` alone is not enough now that marketplace
    // and research are separate pages: the nav writes its landing-page
    // links absolutely, as `/#platform`, so they have to be recognised
    // as same-page jumps whenever we are already on that page. Links to
    // another page keep the browser's normal navigation.
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
      lenis.scrollTo(target, { offset: -72 });
      // Keep the address bar honest without triggering a jump.
      history.pushState(null, "", url.hash);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
