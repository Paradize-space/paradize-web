import Link from "next/link";

import { Wordmark } from "@/components/chrome/site-header";
import { partCredits } from "@/lib/data/demo-market";
import { navItems } from "@/lib/nav";
import {
  heroVideo,
  photoCredits,
  textureCredits,
  unsplashProfile,
} from "@/lib/photos";

/**
 * The foot of the document.
 *
 * Closes on the name at monument scale, cropped by the bottom edge the
 * way the reference crops it at the top. The photo credits are real and
 * link out to the photographers — the Unsplash Licence does not require
 * it, but the pictures were taken by people.
 */
export function SiteFooter() {
  // The parts marketplace preview carries its own photographs, so its
  // photographers belong in the same list. Keyed by handle, so anyone
  // appearing in both sets is credited once.
  const uniqueCredits = [
    ...new Map(
      [...photoCredits, ...partCredits, ...textureCredits].map((p) => [
        p.handle,
        p,
      ]),
    ).values(),
  ];

  return (
    <footer className="relative overflow-hidden">
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <div className="border-line grid gap-10 border-t py-14 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <Wordmark />
            </Link>
            <p className="text-small text-mute mt-5 max-w-[34ch]">
              A place to document hardware projects and source the parts they
              need. In development.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-6">
            <p className="mono text-dim">Sections</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                ...navItems,
                {
                  href: "#early-access",
                  label: "Early access",
                  kind: "anchor" as const,
                },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-small text-mute hover:text-fg transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4 lg:col-start-9">
            <p className="mono text-dim">Photography &amp; film</p>
            <p className="text-small text-mute mt-4 max-w-[38ch]">
              Stock images under the Unsplash Licence and one clip under the
              Pexels Licence. They show other people&rsquo;s hardware. Paradize
              has no product to photograph yet.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {uniqueCredits.map((credit) => (
                <li key={credit.handle}>
                  <a
                    href={unsplashProfile(credit.handle)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono text-dim hover:text-fg transition-colors"
                  >
                    {credit.by}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={heroVideo.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono text-dim hover:text-fg transition-colors"
                >
                  {heroVideo.by}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="border-line mono text-dim border-t py-5">
          paradize.space
        </p>
      </div>

      {/* The signature, cut off by the bottom of the page. */}
      <span
        aria-hidden="true"
        className="text-monument sign-rise text-ghost -mb-[0.22em] block w-full text-center leading-none whitespace-nowrap select-none"
      >
        PARADIZE
      </span>
    </footer>
  );
}
