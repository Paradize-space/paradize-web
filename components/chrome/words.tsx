import { Fragment, type ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * A heading whose words rise out from behind a mask, one after another.
 *
 * This is the effect GSAP's SplitText is doing on the reference, which
 * is most of why its headings feel expensive — but done on the CSS
 * scroll timeline instead, so it costs no JavaScript at all.
 *
 * Each word gets two spans: an outer one that clips, and an inner one
 * that travels up into it. The outer clip has to be padded and pulled
 * back by the same amount or `overflow: hidden` shears the descenders
 * off g, y and p.
 *
 * Split by WORD, never by character. Per-character splitting is what
 * makes some screen readers spell a heading out letter by letter; words
 * separated by real spaces read normally.
 *
 * The stagger is the `--i` custom property, which the stylesheet turns
 * into a per-word offset on the animation range. Where scroll-driven
 * animation is unsupported, or motion is not wanted, none of it applies
 * and the words are simply words.
 */
export function Words({
  children,
  as: Tag = "span",
  className,
}: {
  children: string;
  as?: ElementType;
  className?: string;
}) {
  const words = children.split(" ");

  return (
    <Tag className={cn("words", className)}>
      {words.map((word, i) => (
        // The space goes BETWEEN the word spans, never inside one: the
        // outer span is an overflow-hidden inline-block, and a space
        // parked inside it gets clipped away, running every word in the
        // heading together.
        <Fragment key={`${word}-${i}`}>
          <span className="word" style={{ "--i": i } as React.CSSProperties}>
            <span className="word-i">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
