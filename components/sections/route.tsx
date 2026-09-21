import Image from "next/image";

import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { photos } from "@/lib/photos";

/**
 * The route, end to end.
 *
 * The two-column shape here is the reference's: a title that sticks to
 * the viewport in the left column while the right column scrolls a long
 * ruled list past it. Pure CSS `position: sticky` — no scroll handler,
 * no pinning library.
 */
const steps = [
  {
    n: "01",
    station: "Project",
    heading: "Write the project down once.",
    body: "One project holds the design, the build instructions, the parts list and the firmware that goes with them.",
    photo: photos.handsWiring,
  },
  {
    n: "02",
    station: "Releases",
    heading: "Publish a release each time it changes.",
    body: "A release pins one snapshot: board revision, firmware, parts list, instructions. The project can move on without breaking the build someone started last month.",
    photo: photos.chipPlace,
  },
  {
    n: "03",
    station: "Build",
    heading: "Someone else builds that exact version.",
    body: "They build a published release. One release, one set of instructions, one unit that matches it.",
    photo: photos.soldering,
  },
  {
    n: "04",
    station: "Inventory",
    heading: "Check it against the parts you own.",
    body: "Your inventory knows the difference between free and already committed. A part sitting inside another build counts as in use.",
    photo: photos.benchParts,
  },
  {
    n: "05",
    station: "Source",
    heading: "Source only the gap.",
    body: "Whatever is left becomes a kit: the lines you are short of.",
    photo: photos.boardDark,
  },
];

export function Route() {
  return (
    <section id="route" className="px-4 pb-28 sm:px-6 sm:pb-40">
      <div className="mx-auto grid max-w-page gap-x-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <Words as="h2" className="text-heading max-w-[14ch] text-balance">
              {"From a published project to a finished build."}
            </Words>
            <p className="text-small text-mute mt-6 max-w-[34ch]">
              Five steps, end to end. None of it is live yet; this is the shape
              of what we are building.
            </p>
          </div>
        </div>

        <ol className="ruled mt-14 lg:col-span-7 lg:col-start-6 lg:mt-0">
          {steps.map((step) => (
            <Reveal as="li" key={step.n} className="py-12">
              <div className="flex items-baseline gap-5">
                <span className="mono text-dim tnum">{step.n}</span>
                <span className="mono text-dim">{step.station}</span>
              </div>

              <h3 className="text-sub mt-5 max-w-[22ch] text-balance">
                {step.heading}
              </h3>
              <p className="text-small text-mute mt-4 max-w-[46ch]">
                {step.body}
              </p>

              <AspectRatio
                ratio={16 / 9}
                className="bg-slab relative mt-8 overflow-hidden"
              >
                <Image
                  src={step.photo.src}
                  alt={step.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 52vw, 92vw"
                  className="photo parallax object-cover opacity-65"
                />
              </AspectRatio>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
