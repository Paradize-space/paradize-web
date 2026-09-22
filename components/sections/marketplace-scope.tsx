import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";

/**
 * What the marketplace does not do yet.
 *
 * This used to be one small badge inside the kit card, which is the
 * wrong weight for it: a visitor deciding whether this is a shop
 * deserves a straight answer at full size rather than fine print. Every
 * line here is a statement of absence, so none of it can age into a
 * false claim — when one becomes untrue it gets deleted, not rewritten.
 */
const notYet = [
  {
    k: "No pricing",
    v: "Nothing on this page carries a price, because no supplier is connected to quote one.",
  },
  {
    k: "No sellers",
    v: "No distributor, marketplace or store is integrated. Where a part would come from is undecided.",
  },
  {
    k: "No checkout",
    v: "There is no basket and no payment. The kit is a list, and the list is all it is.",
  },
  {
    k: "No stock",
    v: "Availability is read from the sample inventory in this page, not from anybody's warehouse.",
  },
];

export function MarketplaceScope() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-page">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
            <Words
              as="h2"
              className="text-heading max-w-[18ch] text-balance lg:col-span-7"
            >
              {"What this is not, yet."}
            </Words>
            <p className="text-small text-mute self-end lg:col-span-4 lg:col-start-9">
              The marketplace is the least built of the three streams. It is
              easier to say plainly what is missing than to let the page imply a
              shop.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <dl className="ruled ruled-grid mt-14 grid sm:grid-cols-2 sm:gap-x-12">
            {notYet.map((row) => (
              <div key={row.k} className="py-6">
                <dt className="mono text-gone">{row.k}</dt>
                <dd className="text-small text-mute mt-3 max-w-[44ch]">
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
