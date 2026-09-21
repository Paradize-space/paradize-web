import Image from "next/image";
import Link from "next/link";

import { HeroMedia } from "@/components/sections/hero-media";
import { Button } from "@/components/ui/button";
import { heroVideo } from "@/lib/photos";

/**
 * The title screen.
 *
 * Structured exactly as the reference structures its own: one full-bleed
 * photograph, the name set at monument scale across it, a mono caption
 * pinned to each bottom corner, one small outlined control on the left
 * and one solid card on the right. The value proposition does not live
 * here — it gets the whole of the next screen, at 70px, which is how the
 * reference paces it too.
 *
 * `preload` replaced `priority` in Next 16; for an LCP image the docs
 * now point at loading="eager" with fetchPriority="high".
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-svh flex-col overflow-hidden"
    >
      {/* Two layers under one scrim: the photograph carries the first
          paint, the clip covers it once it can actually play. The whole
          stack scales forward together as the screen leaves.

          Both children are fully opaque. They used to be 70% each,
          which meant the clip never covered the still underneath it and
          30% of a different board stayed visible through it for as long
          as the page was open — the double exposure this used to show.
          The exposure now lives in the .photo-hero filter instead. */}
      <div className="scrim-b absolute inset-0 -z-10">
        <div className="hero-photo absolute inset-0">
          {/* The clip's own frame zero — so when the video takes over
              there is nothing to dissolve between. */}
          <Image
            src={heroVideo.poster}
            alt={heroVideo.alt}
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            quality={80}
            className="photo-hero object-cover object-center"
          />
          <HeroMedia />
        </div>
      </div>

      {/* The name, allowed to run past both edges.
          In flow rather than absolutely centred: on a phone the copy
          block below is tall enough that a centred word lands on top of
          it, and letting the flex row take the slack fixes that at every
          width instead of at one. */}
      <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center px-2 pt-14 select-none">
        <h1 className="text-monument monument-exit text-fg/92 whitespace-nowrap">
          PARADIZE
        </h1>
      </div>

      <div className="relative z-10 flex flex-col gap-8 px-4 pb-6 sm:px-6 sm:pb-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="mono text-fg max-w-[26ch] leading-[1.7]">
            A home for hardware projects. Write one down once, and someone else
            can build that same version later.
          </p>

          <p className="mono text-mute max-w-[24ch] leading-[1.7] sm:text-right">
            Platform, marketplace and internal research. In development.
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <Button
            render={<Link href="#route" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="mono h-9 gap-2 px-4"
          >
            <span aria-hidden="true">&#8627;</span>
            See how it works
          </Button>

          {/* The reference's order card, doing our job: the one action. */}
          <div className="screws bg-fg text-bg w-full max-w-xs px-5 py-4 sm:w-auto sm:min-w-[19rem]">
            <span className="screw-b" aria-hidden="true" />
            <p className="mono text-bg/70 text-center">
              Paradize is pre-launch
            </p>
            <Button
              render={<Link href="#early-access" />}
              nativeButton={false}
              className="mono bg-bg text-fg hover:bg-bg/85 mt-3 h-9 w-full"
            >
              Join the waitlist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
