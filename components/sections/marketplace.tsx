import Image from "next/image";

import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { Badge } from "@/components/ui/badge";
import {
  checkRequirements,
  defaultReleaseId,
  getRelease,
} from "@/lib/data/desk-sensor";
import { photos } from "@/lib/photos";

/**
 * The kit: only what the build is short of.
 *
 * The figures are derived from the same fixture the requirement check
 * uses, so the two sections can never contradict each other. There is
 * deliberately no price, no seller and no basket — no store is
 * connected, and the panel says so on its face rather than implying a
 * shop that does not exist.
 */
export function Marketplace() {
  const release = getRelease(defaultReleaseId);
  const checks = checkRequirements(release);

  const toSource = checks.filter((c) => c.status === "missing");
  const alreadyHeld = checks.filter((c) => c.status !== "missing");

  return (
    <section id="marketplace" className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-page">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
            <Words
              as="h2"
              className="text-heading max-w-[16ch] text-balance lg:col-span-7"
            >
              {"Only the parts you are short of."}
            </Words>
            <p className="text-small text-mute self-end lg:col-span-4 lg:col-start-9">
              A kit is the difference between a release and your inventory.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-7">
            <div className="bg-slab relative aspect-16/10 overflow-hidden">
              <Image
                src={photos.benchParts.src}
                alt={photos.benchParts.alt}
                fill
                sizes="(min-width: 1024px) 56vw, 92vw"
                className="photo parallax object-cover opacity-60"
              />
            </div>

            <p className="mono text-dim mt-8">
              Already yours · {alreadyHeld.length} lines
            </p>
            <ul className="ruled mt-3">
              {alreadyHeld.map((check) => (
                <li
                  key={check.item.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
                >
                  <span className="text-small">{check.item.name}</span>
                  <span className="data text-mute">{check.holding}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-4 lg:col-start-9">
            <div className="screws border-line-2 border">
              <span className="screw-b" aria-hidden="true" />
              <div className="border-line border-b px-5 py-4">
                <p className="mono text-dim">Missing-parts kit</p>
                <p className="text-sub mt-2">
                  {toSource.length} line{toSource.length === 1 ? "" : "s"} to
                  source
                </p>
                <p className="data text-mute mt-1">
                  {release.name} · {release.hardwareRevision}
                </p>
              </div>

              <ul className="px-5">
                {toSource.map((check) => (
                  <li
                    key={check.item.id}
                    className="border-line flex items-baseline justify-between gap-4 border-b py-4 last:border-b-0"
                  >
                    <span>
                      <span className="data text-dim block">
                        {check.item.ref}
                      </span>
                      <span className="text-small mt-1 block">
                        {check.item.name}
                      </span>
                    </span>
                    <span className="data text-mute">×{check.required}</span>
                  </li>
                ))}
              </ul>

              <div className="border-line border-t px-5 py-5">
                <Badge
                  variant="outline"
                  className="mono border-gone/40 text-gone rounded-none"
                >
                  Preview · no store connected
                </Badge>
                <p className="text-small text-mute mt-3">
                  No pricing, seller or checkout behind this yet. It shows the
                  shape of a kit.
                </p>
              </div>
            </div>

            <div className="border-line mt-6 border px-5 py-5">
              <p className="mono text-dim">AI-assisted kit planning</p>
              <p className="text-small mt-3">
                Help organising requirements and reviewing alternatives.
              </p>
              <p className="text-small text-mute mt-2">
                Suggestions come to you for review. Whether a substitute
                actually fits is your call.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
