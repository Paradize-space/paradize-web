import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";

/**
 * The sentence.
 *
 * The reference gives its one claim an entire screen at ~68px, weight
 * 400, tracked in hard, with nothing else on it. That restraint is most
 * of why the page reads as confident, so it is copied exactly.
 */
export function Statement() {
  return (
    <section className="px-4 pb-28 sm:px-6 sm:pb-40 lg:pb-56">
      <Reveal className="mx-auto max-w-page">
        <Words as="p" className="text-statement max-w-[20ch] text-balance">
          {
            "Most hardware projects die in the gap between finding one and building it."
          }
        </Words>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-x-12">
          <p className="text-lead text-mute lg:col-span-5">
            Files drift. Instructions go stale. The board someone photographed
            two years ago is on its third revision, and nobody wrote down which
            one the photographs belong to.
          </p>
          <p className="text-lead text-mute lg:col-span-5 lg:col-start-7">
            Paradize closes that gap. A project is written down once and
            published as releases, so the version someone builds is a version
            that was really shipped.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
