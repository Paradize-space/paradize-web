import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { Badge } from "@/components/ui/badge";
import { statusCopy, type RequirementStatus } from "@/lib/data/desk-sensor";
import { statusTone } from "@/lib/status-tone";

/**
 * How a kit gets its lines.
 *
 * Not new copy invented to fill a page: these four states are the
 * actual branches of `checkRequirements()` in the fixture, and the
 * labels and descriptions are read straight out of `statusCopy`. A kit
 * is whatever comes back as `missing`, so explaining the states is
 * explaining what you would be buying.
 *
 * The order is deliberate — held, committed, absent, and then tools,
 * which are the exception that never lands in a kit at all.
 */
const order: RequirementStatus[] = ["ready", "in-use", "missing", "tool-ready"];

const consequence: Record<RequirementStatus, string> = {
  ready: "Stays out of the kit.",
  "in-use":
    "Stays out of the kit. Buy another only if you want both builds standing at once.",
  missing: "This is the kit.",
  "tool-ready": "Never in a kit. A tool is needed, not consumed.",
};

export function KitStates() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-page">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
            <Words
              as="h2"
              className="text-heading max-w-[16ch] text-balance lg:col-span-7"
            >
              {"Four ways a line can go."}
            </Words>
            <p className="text-small text-mute self-end lg:col-span-4 lg:col-start-9">
              A release lists what a build needs. Each line is checked against
              what you hold, and only one of these four outcomes ends up costing
              you anything.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <dl className="ruled mt-14">
            {order.map((status) => (
              <div
                key={status}
                className="grid gap-x-8 gap-y-3 py-6 sm:grid-cols-12 sm:items-baseline"
              >
                <dt className="sm:col-span-3">
                  <Badge
                    variant="outline"
                    className={`mono rounded-none ${statusTone[status]}`}
                  >
                    {statusCopy[status].label}
                  </Badge>
                </dt>
                <dd className="text-small sm:col-span-5">
                  {statusCopy[status].description}
                </dd>
                <dd className="text-small text-mute sm:col-span-4">
                  {consequence[status]}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
