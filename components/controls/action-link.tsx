import { CornerDownRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The one thing to do next in a section: a light bar with a ↳ arrow,
 * after the reference's "Explore" buttons. On hover the bar dims and
 * the arrow draws back, as if about to go.
 */
export function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    // A real link in the button's clothes (see NavPill for why).
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "action", size: "action" }),
        "group/action min-w-[15.625rem] justify-start",
        className,
      )}
    >
      <ActionArrow />
      {children}
    </Link>
  );
}

/**
 * The ↳ on its own, for an action that submits a form rather than
 * links somewhere. Put it in a Button with variant and size "action"
 * and the class `group/action`.
 */
export function ActionArrow() {
  return (
    <CornerDownRight
      aria-hidden="true"
      strokeWidth={1.5}
      className="size-4 transition-transform duration-400 group-hover/action:-translate-x-2"
    />
  );
}
