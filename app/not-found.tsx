import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/nav";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * Next's built-in version is unstyled and white, which on a site this
 * dark reads as a broken deploy rather than a missing page. This one is
 * the title screen with the number in place of the name, and it offers
 * the four real sections rather than a bare "go home".
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main
        id="main"
        className="relative isolate flex min-h-svh flex-col overflow-hidden"
      >
        <div className="scrim-b absolute inset-0 -z-10">
          <Image
            src={photos.boardDark.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            loading="eager"
            className="photo object-cover opacity-55"
          />
        </div>

        <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center px-2 pt-14 select-none">
          <p aria-hidden="true" className="text-monument text-fg/90">
            404
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-8 px-4 pb-10 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-sub">This page does not exist.</h1>
              <p className="mono text-mute mt-3 max-w-[34ch] leading-[1.7]">
                Paradize is one page for now. Everything there is to read is on
                it.
              </p>
            </div>

            <nav aria-label="Sections">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${item.href}`}
                      className="mono text-mute hover:text-fg transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="mono h-9 gap-2 px-4"
            >
              <span aria-hidden="true">&#8627;</span>
              Back to the start
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
