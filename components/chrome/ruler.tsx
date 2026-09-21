import { cn } from "@/lib/utils";

/**
 * The page's one recurring graphic mark.
 *
 * Before this the page had no vector graphic anywhere — it was
 * photography, type and plain rules, which left it with no device of its
 * own between sections. A graduated ruler is the right one to invent
 * here because it is not decoration: Paradize is about measuring a build
 * against what you hold, and a measuring edge says that in the same
 * hairline-and-mono language everything else is already speaking.
 *
 * The ticks are a repeating gradient rather than markup, so a full-width
 * ruler is two pseudo-elements and no DOM. Both the line and the ticks
 * scale in from the left as the divider arrives.
 */
export function Ruler({
  label,
  index,
  total = "07",
  className,
}: {
  /** Short mono caption at the left end, e.g. "Route". */
  label?: string;
  /** Two-digit section number. */
  index?: string;
  /** How many sections there are, for the fraction. */
  total?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        // It is a divider, not a caption on the heading below it, so it
        // needs air on both sides to read as its own beat.
        "mx-auto w-full max-w-page px-4 pt-6 pb-20 sm:px-6 sm:pb-28",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {/* `02/07`, not `02 —`. The stream tiles inside the page are
            numbered 01–03 on their own scale, and two bare ordinals in
            view at once read as one sequence. The fraction says plainly
            that this one counts position in the document. */}
        {index ? (
          <p className="mono text-dim tnum shrink-0 -translate-y-[0.35em] whitespace-nowrap">
            {index}/{total}
          </p>
        ) : null}
        <span className="ruler grow" />
        {label ? (
          <p className="mono text-dim shrink-0 -translate-y-[0.35em] whitespace-nowrap">
            {label}
          </p>
        ) : null}
      </div>
    </div>
  );
}
