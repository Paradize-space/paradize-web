"use client";

import { useEffect, useState } from "react";

import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { Button } from "@/components/ui/button";
import { demoProfile, listings, marketQuery } from "@/lib/data/demo-market";
import { order, PHASES } from "@/lib/data/demo-flow";
import {
  checkRequirements,
  defaultReleaseId,
  deskSensor,
  getRelease,
} from "@/lib/data/desk-sensor";
import { cn } from "@/lib/utils";

import { useCamera, useMarks } from "./camera";
import { MarketScreen, ProfileScreen, ProjectScreen } from "./screens";

/**
 * The marketplace flow, played back like a screen recording.
 *
 * Someone's profile, one of their projects, what that release is made
 * of, clone it, check the parts list against your own shelf, then go
 * and find the one line you are short of and put it in a cart. A
 * pointer drives it and a camera follows — pushing in on whatever is
 * being touched, pulling back to show the result — so it reads as
 * somebody using software rather than as a diagram of software.
 *
 * This file is only the player: the clock, the transport and the
 * window. The beats live in lib/data/demo-flow.ts, the camera
 * arithmetic in ./camera.ts, and the three screens in ./screens.tsx.
 *
 * It is a PREVIEW and is labelled as one on its face. None of this
 * interface is built and nothing here talks to a server.
 *
 * Two things are deliberately missing from the listings. There are no
 * prices and no sellers, because nothing is connected, so any figure
 * in those columns would be invented. And the listing titles describe
 * a CLASS of part rather than naming the product in the photograph:
 * the photographs are real components under a stock licence, and
 * captioning a real manufacturer's board as something Paradize lists
 * would imply a supplier relationship that does not exist.
 *
 * Accessibility:
 *   · the window is aria-hidden and a text equivalent sits beside it,
 *     since a screen reader can follow neither a pointer nor a camera
 *   · it loops, so WCAG 2.2.2 requires a way to stop it — hence the
 *     play/pause control, which is a real focusable button outside the
 *     hidden subtree
 *   · under prefers-reduced-motion nothing moves at all: no camera, no
 *     pointer, just the finished state
 */
export function CloneDemo() {
  const release = getRelease(defaultReleaseId);
  const lines = checkRequirements(release).filter(
    ({ item }) => item.kind === "component",
  );
  const missingLine = lines.find((l) => l.status === "missing");
  const covered = lines.filter((l) => l.status !== "missing").length;
  const pick = listings.find((l) => l.matches) ?? listings[0];

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  // Keyed by the beat it belongs to, so a count left over from the
  // previous time round the loop cannot flash the finished string for
  // one interval before the new run overwrites it.
  const [typed, setTyped] = useState({ beat: -1, n: 0 });

  const step = PHASES[index];
  const { phase, screen } = step;
  const at = index;

  const marks = useMarks();
  const { viewRef, contentRef, cam, cursor } = useCamera(step, reduced, marks);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(query.matches);
      if (query.matches) {
        setPlaying(false);
        setIndex(PHASES.length - 1);
      }
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!playing || reduced) return;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % PHASES.length),
      step.hold,
    );
    return () => clearTimeout(id);
  }, [index, playing, reduced, step.hold]);

  // The query types itself in on the search beat. Before it the field
  // is empty; after it, the whole string stands. Both of those are
  // derived below rather than stored, so the effect only has to run
  // the typing itself.
  useEffect(() => {
    if (reduced || at !== order("search")) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setTyped({ beat: at, n });
      if (n >= marketQuery.length) clearInterval(id);
    }, 52);
    return () => clearInterval(id);
  }, [at, reduced]);

  const shown =
    reduced || at > order("search")
      ? marketQuery.length
      : at < order("search") || typed.beat !== at
        ? 0
        : typed.n;

  const cloned = at >= order("clone");
  const checked = at >= order("check");
  const inCart = at >= order("cart");

  const path =
    screen === "profile"
      ? `paradize / ${demoProfile.handle}`
      : screen === "project"
        ? `paradize / ${demoProfile.handle} / ${deskSensor.slug}`
        : "paradize / parts";

  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-page">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
            <Words
              as="h2"
              className="text-heading max-w-[17ch] text-balance lg:col-span-7"
            >
              {"Clone a release, keep what you have, source the rest."}
            </Words>
            <p className="text-small text-mute self-end lg:col-span-4 lg:col-start-9">
              A preview of the interface being built. Nothing here is live, no
              store sits behind it, and nothing in it can be bought.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-8">
              {/* Transport above the window, not below it. Below, the
                  floating waitlist card covers this on a phone — and a
                  pause control for looping content is a requirement,
                  not decoration, so it cannot be something a sticky
                  element is allowed to sit on top of. */}
              <div className="mb-4 flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="mono h-8 shrink-0 px-3"
                  onClick={() => {
                    if (reduced) setReduced(false);
                    setPlaying((p) => !p);
                  }}
                >
                  {playing && !reduced ? "Pause" : "Play"}
                </Button>

                <p className="mono text-dim shrink-0">
                  {String(index + 1).padStart(2, "0")}/
                  {String(PHASES.length).padStart(2, "0")}
                </p>

                {/* One caption at a time. Eleven of them listed at
                    once is a wall of text nobody reads, and it wraps
                    to four lines on a phone. */}
                <span
                  aria-hidden="true"
                  className="bg-line-2 hidden h-px flex-1 sm:block"
                />
                <p className="mono text-fg min-w-0 flex-1 truncate sm:flex-none">
                  {step.caption}
                </p>
              </div>

              {/* The viewport. A fixed height, because the three
                  screens are different lengths and letting the window
                  resize under the camera shunts the rest of the page
                  up and down on every navigation. The figures are the
                  tallest screen measured at each width, so nothing is
                  cropped: 563px at a 380px column, 514px from ~600px
                  up. The narrow case is the TALLER one, which is why
                  the mobile height is the larger of the two. */}
              <div
                ref={viewRef}
                aria-hidden="true"
                className="screws border-line-2 bg-slab relative h-[600px] overflow-hidden border sm:h-[570px]"
              >
                <span className="screw-b" aria-hidden="true" />

                <div
                  ref={contentRef}
                  className="absolute inset-x-0 top-0 origin-top-left transition-transform duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{
                    transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`,
                  }}
                >
                  {/* Window chrome. The path and the cart persist
                      across screens, so the navigation reads as
                      navigation rather than as three unrelated
                      pictures. */}
                  <div className="border-line flex items-center justify-between gap-4 border-b px-4 py-3">
                    <p className="mono text-dim truncate">{path}</p>
                    <span
                      className={cn(
                        "mono shrink-0 border px-2 py-1 transition-colors duration-300",
                        inCart
                          ? "border-ok/40 text-ok"
                          : "border-line-2 text-dim",
                      )}
                    >
                      Cart {inCart ? 1 : 0}
                    </span>
                  </div>

                  <div
                    key={screen}
                    className="[animation:panel-in_420ms_cubic-bezier(0.22,0.7,0.25,1)_both]"
                  >
                    {screen === "profile" ? (
                      <ProfileScreen
                        at={at}
                        setProjectRow={marks.set.projectRow}
                      />
                    ) : null}

                    {screen === "project" ? (
                      <ProjectScreen
                        release={release}
                        lines={lines}
                        cloned={cloned}
                        checked={checked}
                        phase={phase}
                        setClone={marks.set.clone}
                        setList={marks.set.list}
                        setShortfall={marks.set.shortfall}
                      />
                    ) : null}

                    {screen === "market" ? (
                      <MarketScreen
                        at={at}
                        shown={shown}
                        inCart={inCart}
                        phase={phase}
                        pick={pick}
                        missingRef={missingLine?.item.ref}
                        setSearch={marks.set.search}
                        setResults={marks.set.results}
                        setAdd={marks.set.add}
                      />
                    ) : null}
                  </div>

                  {/* The pointer rides inside the content, so the
                      camera scales it the way a screen recording
                      would. */}
                  {cursor && !reduced ? (
                    <>
                      <svg
                        viewBox="0 0 12 18"
                        className="pointer-events-none absolute z-10 h-[18px] w-[12px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] transition-[left,top] duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
                        style={{ left: cursor.x, top: cursor.y }}
                      >
                        <path
                          d="M1 1 L1 14 L4.5 11 L6.8 16.5 L9 15.5 L6.8 10.2 L11 10 Z"
                          fill="#f1f1f1"
                          stroke="#010101"
                          strokeWidth="1"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {step.press ? (
                        <span
                          className="border-fg/70 pointer-events-none absolute z-0 block size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                          style={{
                            left: cursor.x,
                            top: cursor.y,
                            animation: "click-pulse 600ms ease-out both",
                          }}
                        />
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* The text equivalent. Not a caption — this is what a
                screen reader gets instead of the pointer. */}
            <div className="lg:col-span-4">
              <p className="mono text-dim">What the preview shows</p>
              <ol className="ruled mt-4">
                <li className="text-small py-3">
                  A profile, and {deskSensor.name} among its published projects.
                </li>
                <li className="text-small py-3">
                  {release.name} cloned as it shipped, with the apparatus that
                  release calls for.
                </li>
                <li className="text-small py-3">
                  {covered} of {lines.length} lines covered by what you already
                  hold; the {missingLine?.item.name.toLowerCase()} is not.
                </li>
                <li className="text-small py-3">
                  That one line searched for and added to a cart. Nothing you
                  own is bought twice.
                </li>
              </ol>
              <p className="text-small text-mute mt-6">
                The interface above is not built and not connected to anything.
                No supplier, price or checkout stands behind it.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
