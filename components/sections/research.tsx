import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

/**
 * Research.
 *
 * There is nothing published, so the section says nothing is published.
 * The registry's Empty component exists for exactly this and is more
 * honest than inventing three paper titles to fill the column.
 *
 * It used to carry a full-bleed photograph of its own. Now that it is a
 * page rather than one band among several, that fought the photograph
 * in the page header directly above it — and a section about having
 * nothing to show is the last place to pile imagery on. Plain ground.
 */
export function Research() {
  return (
    <section id="research" className="relative">
      <div className="mx-auto max-w-page px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            {/* No heading of its own any more: the page header above
                carries the h1, and a second near-identical title a few
                hundred pixels below it was just an echo. */}
            <div className="lg:col-span-6">
              <Words as="h2" className="text-heading max-w-[15ch] text-balance">
                {"Named from the start, published when there is something."}
              </Words>
              <p className="text-small text-mute mt-8 max-w-[46ch]">
                It is closed to outside submissions, and we have not set out the
                direction publicly. It is part of the organisation rather than a
                plan for one, which is why it has a page at all.
              </p>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <div className="screws border-line-2 border">
                <span className="screw-b" aria-hidden="true" />
                <Empty className="px-6 py-16">
                  <EmptyTitle className="mono text-mute">
                    Nothing published yet
                  </EmptyTitle>
                  <EmptyDescription className="text-small text-dim mt-2">
                    When there is something worth reading, it will appear here.
                  </EmptyDescription>
                </Empty>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
