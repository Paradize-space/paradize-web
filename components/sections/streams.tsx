import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { photos } from "@/lib/photos";

/**
 * Three streams as three photo tiles.
 *
 * Lifted from the reference's three-up row near the foot of its page: a
 * dark photograph, a mono label sitting on it top-left, and the real
 * title underneath in the display face. No card chrome, no border, no
 * shadow — the photograph is the tile.
 */
const streams = [
  {
    n: "01",
    name: "Platform",
    href: "/#platform",
    photo: photos.handsWiring,
    body: "Profiles, project docs, hardware and firmware releases, builds that know your parts bin.",
  },
  {
    n: "02",
    name: "Marketplace",
    href: "/marketplace",
    photo: photos.components,
    body: "Components and kits, tied to the release you are building.",
  },
  {
    n: "03",
    name: "Research",
    href: "/research",
    photo: photos.darkDesk,
    body: "Work by the team inside Paradize.",
  },
];

export function Streams() {
  return (
    <section id="streams" className="px-4 pb-28 sm:px-6 sm:pb-40">
      <div className="mx-auto max-w-page">
        <Reveal>
          <Words as="h2" className="text-heading max-w-[18ch] text-balance">
            {"Three streams, built together."}
          </Words>
        </Reveal>

        <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => (
            <Reveal as="li" key={stream.n}>
              <Link href={stream.href} className="group block">
                <AspectRatio
                  ratio={4 / 3}
                  className="relative overflow-hidden bg-slab"
                >
                  <Image
                    src={stream.photo.src}
                    alt={stream.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                    className="photo parallax object-cover opacity-70 transition-opacity duration-700 group-hover:opacity-95"
                  />
                  <span className="mono text-fg absolute top-3 left-3 z-10">
                    {stream.n} — {stream.name}
                  </span>
                </AspectRatio>

                <h3 className="text-sub mt-5 flex items-center gap-2">
                  {stream.name}
                  <span
                    aria-hidden="true"
                    className="text-dim transition-transform duration-300 group-hover:translate-x-1"
                  >
                    &#8599;
                  </span>
                </h3>
                <p className="text-small text-mute mt-2 max-w-[38ch]">
                  {stream.body}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
