"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * The bar, laid out the way the reference lays it out: links hard left,
 * the mark dead centre, actions hard right — no container, no pill, and
 * every label in mono at 11px.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-[1.05rem] leading-none tracking-[0.34em] uppercase">
        Paradize
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const pathname = usePathname();
  // Mark the section the middle of the viewport is currently in. Reading
  // positions on scroll rather than using IntersectionObserver ratios,
  // because these sections are wildly different heights and the tallest
  // would otherwise win every comparison.
  //
  // Only the anchor items are tracked this way. The hrefs are absolute
  // now that marketplace and research are their own pages, so the id has
  // to be taken off the end — `querySelector("/#platform")` throws.
  useEffect(() => {
    const sections = navItems
      .filter((item) => item.kind === "anchor")
      .map((item) => document.getElementById(item.href.split("#")[1] ?? ""))
      .filter((node): node is HTMLElement => Boolean(node));

    if (sections.length === 0) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const middle = window.innerHeight / 2;
        let active: string | null = null;
        for (const section of sections) {
          const box = section.getBoundingClientRect();
          if (box.top <= middle && box.bottom > middle)
            active = `/#${section.id}`;
        }
        setCurrent(active);
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  // An anchor is current when its section owns the middle of the
  // viewport; a route is current when you are simply on it.
  const isCurrent = (item: NavItem) =>
    item.kind === "route" ? pathname === item.href : current === item.href;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* The bar itself stays transparent, as on the reference, but the
          page scrolls underneath it — so a short fade carries it over
          whatever happens to be passing. Without this, section labels
          collide with the nav. */}
      <div
        aria-hidden="true"
        className="from-bg/95 via-bg/70 pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent"
      />
      {/* How far through the document you are. One hairline, filled by
          the root scroll timeline — no listener, no state. */}
      <div
        aria-hidden="true"
        className="bg-line absolute inset-x-0 bottom-0 h-px"
      >
        <div className="progress-bar bg-fg/45 h-full origin-left" />
      </div>

      <div className="relative flex h-14 items-center justify-between px-4 sm:px-6">
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-5">
            {navItems.map((item, i) => (
              <li key={item.href} className="flex items-center gap-5">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-dim text-[8px]">
                    &#9679;
                  </span>
                ) : null}
                <Link
                  href={item.href}
                  aria-current={isCurrent(item) ? "true" : undefined}
                  className={cn(
                    "mono transition-colors hover:text-fg",
                    isCurrent(item) ? "text-fg" : "text-mute",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/"
          aria-label="Paradize, home"
          className="lg:absolute lg:left-1/2 lg:-translate-x-1/2"
        >
          <Wordmark />
        </Link>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="#early-access" />}
            nativeButton={false}
            size="sm"
            className="mono hidden h-8 px-4 sm:inline-flex"
          >
            Join the waitlist
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="mono h-8 px-3 lg:hidden"
                />
              }
            >
              Menu
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-line bg-bg text-fg w-full max-w-sm p-0"
            >
              <SheetTitle className="mono text-dim border-line border-b px-5 py-5">
                Sections
              </SheetTitle>
              <nav aria-label="Sections" className="px-5 py-2">
                <ul className="flex flex-col">
                  {navItems.map((item) => (
                    <li key={item.href} className="border-line border-b">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="text-sub flex min-h-14 items-center"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button
                  render={<Link href="#early-access" />}
                  nativeButton={false}
                  onClick={() => setOpen(false)}
                  className="mono mt-6 h-11 w-full"
                >
                  Join the waitlist
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
