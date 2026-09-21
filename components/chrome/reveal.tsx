import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Entrance on scroll — with no JavaScript at all.
 *
 * This was `motion`'s `whileInView`, which cost 119 KB of the bundle to
 * fade some text up. CSS scroll-driven animations do the same job on the
 * compositor for nothing, so the library went.
 *
 * The animation lives behind `@supports (animation-timeline: view())`.
 * Where that is unsupported — Firefox at the time of writing — the rule
 * never applies and the content is simply visible, which is the correct
 * fallback: nothing is ever hidden waiting for an animation that cannot
 * run. It is also inside a `prefers-reduced-motion: no-preference`
 * query, so it stands down when asked.
 *
 * This is a server component now; it ships no JS of its own either.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={cn("reveal", className)}>{children}</Tag>;
}
