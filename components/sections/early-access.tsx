import Image from "next/image";

import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { WaitlistForm } from "@/components/sections/waitlist-form";
import { photos } from "@/lib/photos";

const facts = [
  { k: "What you get", v: "Occasional development updates." },
  { k: "What we store", v: "Your address and the streams you picked." },
  { k: "Right now", v: "No store is connected, and the form says so." },
];

export function EarlyAccess() {
  return (
    <section id="early-access" className="relative isolate overflow-hidden">
      <div className="scrim-full absolute inset-0 -z-10">
        <Image
          src={photos.boardBlack.src}
          alt={photos.boardBlack.alt}
          fill
          sizes="100vw"
          className="photo parallax object-cover opacity-40"
        />
      </div>

      <div className="mx-auto max-w-page px-4 py-28 sm:px-6 sm:py-40">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <Words as="h2" className="text-heading max-w-[13ch] text-balance">
                {"Be part of the first builds."}
              </Words>
              <p className="text-lead text-mute mt-8 max-w-[38ch]">
                We will write when there is something real to show, and when
                early builders can start shaping how it works.
              </p>

              <dl className="ruled mt-10">
                {facts.map((fact) => (
                  <div key={fact.k} className="py-4">
                    <dt className="mono text-dim">{fact.k}</dt>
                    <dd className="text-small mt-2">{fact.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <WaitlistForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
