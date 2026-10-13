"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Dot, NavPill } from "@/components/controls/nav-pill";
import { WaitlistButton } from "@/components/controls/waitlist";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems, utilityItems, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * The bar, as the reference builds it: no bar at all, just frosted
 * pills floating over the page. The streams hard left, the name dead
 * centre, status and the waitlist hard right.
 *
 * On phones it folds to three things, the way the reference's phone
 * header does: the waitlist, the name, and a menu that opens to the
 * whole screen.
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

const allItems = [...navItems, ...utilityItems];

/**
 * Which item is current: a route when you are on it, an anchor when its
 * section owns the middle of the screen. Positions are read on scroll
 * rather than with IntersectionObserver ratios, because the sections
 * are wildly different heights and the tallest would win every time.
 */
function useCurrent() {
  const pathname = usePathname();
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    // Each section on the page, and the item it lights.
    const sections = allItems
      .filter((item) => item.kind === "anchor")
      .flatMap((item) =>
        (item.sections ?? [item.href.split("#")[1] ?? ""]).map((id) => ({
          node: document.getElementById(id),
          href: item.href,
        })),
      )
      .filter((s): s is { node: HTMLElement; href: string } => Boolean(s.node));
    if (sections.length === 0) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const middle = window.innerHeight / 2;
        let active: string | null = null;
        for (const { node, href } of sections) {
          const box = node.getBoundingClientRect();
          if (box.top <= middle && box.bottom > middle) active = href;
        }
        setSection(active);
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

  return (item: NavItem) =>
    item.kind === "route" ? pathname === item.href : section === item.href;
}

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const isCurrent = useCurrent();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* A short fade under the pills, so page text passing beneath
          them does not collide with their labels. */}
      <div
        aria-hidden="true"
        className="from-bg/75 absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent"
      />
      {/* How far through the document you are: one hairline along the
          top edge, filled by the root scroll timeline. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px">
        <div className="progress-bar bg-fg/45 h-full origin-left" />
      </div>

      <div className="relative flex h-16 items-center justify-between px-4 sm:px-7">
        {/* Wide: the streams. */}
        <nav
          aria-label="Streams"
          className="pointer-events-auto hidden lg:block"
        >
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavPill href={item.href} current={isCurrent(item)}>
                  {item.label}
                </NavPill>
              </li>
            ))}
          </ul>
        </nav>

        {/* Phones: the waitlist takes the left. */}
        <WaitlistButton
          variant="pill"
          size="pill"
          className="pointer-events-auto lg:hidden"
        >
          Waitlist
          <Dot />
        </WaitlistButton>

        <Link
          href="/"
          aria-label="Paradize, home"
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2"
        >
          <Wordmark />
        </Link>

        <div className="pointer-events-auto flex items-center gap-1">
          {utilityItems.map((item) => (
            <NavPill
              key={item.href}
              href={item.href}
              current={isCurrent(item)}
              className="hidden lg:inline-flex"
            >
              {item.label}
            </NavPill>
          ))}
          <WaitlistButton
            variant="pill"
            size="pill"
            className="hidden lg:inline-flex"
          >
            Join the waitlist
            <Dot on />
          </WaitlistButton>

          <Sheet open={menu} onOpenChange={setMenu}>
            <SheetTrigger
              render={
                <Button variant="pill" size="pill" className="lg:hidden" />
              }
            >
              Menu
              <MenuIcon aria-hidden="true" className="size-3.5" />
            </SheetTrigger>
            <MobileMenu isCurrent={isCurrent} close={() => setMenu(false)} />
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/**
 * The phone menu: the whole screen, the sections set large, the
 * current one dimmed, and the waitlist as a bar at the foot.
 */
function MobileMenu({
  isCurrent,
  close,
}: {
  isCurrent: (item: NavItem) => boolean;
  close: () => void;
}) {
  const pathname = usePathname();
  const items: NavItem[] = [
    { href: "/", label: "Home", kind: "route" },
    ...allItems,
  ];

  return (
    <SheetContent
      side="top"
      showCloseButton={false}
      className="bg-bg text-fg gap-0 border-0 p-0 data-[side=top]:h-dvh"
    >
      <div className="relative flex h-16 shrink-0 items-center justify-end px-4">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <Link
          href="/"
          onClick={close}
          aria-label="Paradize, home"
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Wordmark />
        </Link>
        <SheetClose render={<Button variant="pill" size="pill" />}>
          Close
          <XIcon aria-hidden="true" className="size-3.5" />
        </SheetClose>
      </div>

      <nav aria-label="Sections" className="flex-1 px-4 pt-12">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const here =
              item.href === "/"
                ? pathname === "/" && !items.slice(1).some(isCurrent)
                : isCurrent(item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={here ? "true" : undefined}
                  className={cn(
                    "text-display block leading-[1.05] transition-opacity duration-400",
                    here ? "text-mute" : "text-fg hover:opacity-70",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 pb-6">
        <p className="mono text-dim mb-3">Paradize is pre-launch</p>
        <WaitlistButton
          variant="line"
          size="card"
          className="h-12"
          onClick={close}
        />
      </div>
    </SheetContent>
  );
}
