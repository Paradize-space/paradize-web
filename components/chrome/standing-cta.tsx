"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The card that follows you down the page.
 *
 * The reference keeps its order card pinned to the bottom-right for the
 * whole document, and it is the single strongest thing that page does
 * for conversion. This is the same idea with the one action Paradize
 * actually has.
 *
 * Two rules keep it from being obnoxious:
 *   · it stays out of the way while the title screen or the early-access
 *     form is on screen — there is already a waitlist button in both,
 *     and a floating duplicate over the form is just clutter
 *   · it can be dismissed, and it stays dismissed for the session
 *
 * While it is off-screen it is `inert`, so it is out of both the tab
 * order and the accessibility tree at once. When it is up it is a real
 * control that a keyboard user can reach, the same as any other.
 */
export function StandingCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Read the dismissal inside the observer callback rather than in an
    // effect body. Setting it synchronously on mount would both trip
    // react-hooks/set-state-in-effect and risk a hydration mismatch,
    // since the server cannot know what is in sessionStorage.
    const wasDismissed = () => {
      try {
        return sessionStorage.getItem("paradize:cta-dismissed") === "1";
      } catch {
        // private mode or blocked storage — treat as not dismissed
        return false;
      }
    };

    const zones = ["top", "early-access"]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (zones.length === 0) return;

    // Visible whenever NONE of the two quiet zones is on screen.
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setVisible(onScreen.size === 0 && !wasDismissed());
      },
      { threshold: 0 },
    );

    zones.forEach((zone) => observer.observe(zone));
    return () => observer.disconnect();
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("paradize:cta-dismissed", "1");
    } catch {
      // nothing to do; it will reappear on the next page load
    }
  };

  return (
    // `inert` rather than `aria-hidden`. aria-hidden on a container that
    // holds a link and a button is invalid — the controls stay in the
    // tab order while being hidden from the accessibility tree, so a
    // keyboard user tabs onto something a screen reader will not name.
    // `inert` removes it from both at once, and only while it is out of
    // sight; when the card is up it is a real, reachable control.
    <div
      inert={!visible}
      aria-label="Waitlist"
      className={cn(
        "fixed right-4 bottom-4 z-40 transition-[opacity,transform] duration-500 sm:right-6 sm:bottom-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <div className="screws bg-fg text-bg flex w-[min(19rem,calc(100vw-2rem))] items-center gap-3 px-4 py-3 sm:block sm:px-5 sm:py-4">
        <span className="screw-b" aria-hidden="true" />

        <button
          type="button"
          onClick={dismiss}
          className="mono text-bg/70 hover:text-bg absolute top-2 right-2.5 p-1 leading-none transition-colors sm:top-2.5 sm:right-3"
        >
          <span className="sr-only">Dismiss the waitlist card</span>
          <span aria-hidden="true">&times;</span>
        </button>

        {/* On a phone this sits over the content for the whole page, so
            it collapses to a single line there. */}
        <p className="mono text-bg/70 hidden text-center sm:block">
          Paradize is pre-launch
        </p>
        <Button
          render={<Link href="#early-access" />}
          nativeButton={false}
          className="mono bg-bg text-fg hover:bg-bg/85 h-9 w-full sm:mt-3"
        >
          Join the waitlist
        </Button>
      </div>
    </div>
  );
}
