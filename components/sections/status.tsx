import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { built, notYet } from "@/lib/status";

/** A short list that wraps like a line of text, each item led by the
 *  header pills' dot: solid where it exists, hollow where it does not. */
function Run({ items, exists }: { items: string[]; exists: boolean }) {
  return (
    <ul
      className={`text-lead mt-4 flex flex-wrap gap-x-7 gap-y-2 ${exists ? "" : "text-mute"}`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-full ${exists ? "bg-fg" : "ring-mute ring-1"}`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Where the platform stands: a heading and the two short lists from
 * lib/status.ts. Kept to a glance; the waitlist is where detail goes.
 */
export function Status() {
  return (
    <section id="status" className="px-4 pb-28 sm:px-7 sm:pb-40">
      <div className="max-w-page mx-auto">
        <Reveal>
          <Words as="h2" className="text-heading max-w-[16ch] text-balance">
            {"Most of the platform is built."}
          </Words>
        </Reveal>

        <Reveal className="border-line mt-12 grid gap-10 border-t pt-6 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <p className="mono text-fg">Built</p>
            <Run items={built} exists />
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="mono text-dim">Not yet</p>
            <Run items={notYet} exists={false} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
