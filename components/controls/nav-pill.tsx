import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A header link, as the reference draws them: a frosted 36px pill with
 * the label on the left and a small dot on the right. The dot is the
 * state: solid for the page or section you are on, dim otherwise.
 */
export function NavPill({
  href,
  current = false,
  onClick,
  className,
  children,
}: {
  href: string;
  current?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    // A link styled as a pill, not a Button rendered as a link: the
    // Button primitive marks its element role="button", and these go
    // somewhere, so they must stay links to assistive tech.
    <Link
      href={href}
      onClick={onClick}
      aria-current={current ? "true" : undefined}
      className={cn(
        buttonVariants({ variant: "pill", size: "pill" }),
        className,
      )}
    >
      {children}
      <Dot on={current} />
    </Link>
  );
}

/** The pill's state dot, shared by every pill so they all agree. */
export function Dot({ on = false }: { on?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-fg size-1.5 shrink-0 rounded-full transition-opacity duration-400",
        on ? "opacity-100" : "opacity-35",
      )}
    />
  );
}
