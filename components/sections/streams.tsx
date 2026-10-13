import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { AspectRatio } from "@/components/ui/aspect-ratio";

/**
 * The other two streams, as tiles: where you leave the landing page for
 * them. The platform is the page you are on, so it has no tile.
 *
 * Each tile is a still of the page it opens, not a stock photograph:
 * the marketplace's network of stores and builders, and the research
 * oscilloscope mid-figure. They are captures of those pages'
 * own drawing (public/home), so the tile and the page always agree.
 *
 * Laid out after the reference's row of tiles near the foot of its
 * page: the picture, a mono label on it top-left, and the title
 * underneath. No card chrome; the picture is the tile.
 */
const streams = [
  {
    n: "02",
    name: "Marketplace",
    href: "/marketplace",
    still: {
      src: "/home/marketplace.webp",
      alt: "The marketplace page: stores and builders joined by arcs, with a rotary encoder and a knob held up by the two stores that stock them.",
    },
    body: "Kits for the parts your shelf is missing. Not open yet.",
  },
  {
    n: "03",
    name: "Research",
    href: "/research",
    still: {
      src: "/home/research.webp",
      alt: "The research page's oscilloscope: a bright beam tracing a curve on black.",
    },
    body: "The lab inside Paradize. Nothing published yet.",
  },
];

export function Streams() {
  return (
    <section id="streams" className="px-4 pb-28 sm:px-7 sm:pb-40">
      <div className="mx-auto max-w-page">
        <Reveal>
          <Words as="h2" className="text-heading max-w-[18ch] text-balance">
            {"Beyond the platform."}
          </Words>
        </Reveal>

        <ul className="mt-14 grid max-w-[96rem] gap-x-6 gap-y-12 sm:grid-cols-2">
          {streams.map((stream) => (
            <Reveal as="li" key={stream.n}>
              <Link href={stream.href} className="group block">
                <AspectRatio
                  ratio={3 / 2}
                  className="relative overflow-hidden bg-slab"
                >
                  <Image
                    src={stream.still.src}
                    alt={stream.still.alt}
                    fill
                    sizes="(min-width: 640px) 46vw, 92vw"
                    className="object-cover opacity-80 transition-[opacity,scale] duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
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
                    &#8594;
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
