"use client";

import { useEffect, useState } from "react";

import { WaitlistButton } from "@/components/controls/waitlist";
import { cn } from "@/lib/utils";

/**
 * The waitlist card, fixed to the corner for the whole visit.
 *
 * The reference keeps one order card in the bottom-right corner from
 * its title screen onwards: the card on the first screen and the card
 * that follows you down are the same element, so it never pops in or
 * duplicates itself. This is that card, with the one action Paradize
 * has.
 *
 * It steps aside, sliding away and back, while anything marked
 * `data-quiet` is on screen: the film, where the corner belongs to the
 * picture, and the waitlist form itself, where a second button would be
 * clutter. On phones it is a single full-width bar along the bottom,
 * as the reference's phone layout has it.
 *
 * While it is out of sight it is `inert`, out of the tab order and the
 * accessibility tree at once.
 */
export function WaitlistCard() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const quiet = document.querySelectorAll("[data-quiet]");
    if (quiet.length === 0) return;
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setVisible(onScreen.size === 0);
      },
      // Quiet a little before the zone reaches the card, not after.
      { rootMargin: "0px 0px -12% 0px" },
    );
    quiet.forEach((zone) => observer.observe(zone));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={!visible}
      aria-label="Waitlist"
      role="region"
      className={cn(
        "fixed inset-x-4 bottom-4 z-40 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:inset-x-auto lg:right-7 lg:bottom-6",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      {/* Phones: one bar. */}
      <WaitlistButton
        variant="line"
        size="card"
        className="bg-bg h-12 lg:hidden"
      />

      {/* Wider: the faceplate, with a screw in each corner. */}
      <div className="bg-fg text-bg hidden w-[17.125rem] rounded-[4px] px-4 py-3 lg:block">
        <Screws />
        <p className="mt-3.5 text-center text-[0.81rem] leading-none tracking-[-0.04em]">
          Paradize is pre-launch
        </p>
        <WaitlistButton variant="ink" size="card" className="mt-2.5" />
        <Screws className="mt-3.5" />
      </div>
    </div>
  );
}

function Screws({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex justify-between", className)}>
      <span className="bg-bg size-1.5 rounded-full" />
      <span className="bg-bg size-1.5 rounded-full" />
    </div>
  );
}
