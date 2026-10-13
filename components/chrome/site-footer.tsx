import Link from "next/link";

import { Wordmark } from "@/components/chrome/site-header";
import { navItems, utilityItems } from "@/lib/nav";
import { SITE_SOCIALS } from "@/lib/site";

/**
 * The foot of the document: the name and what Paradize is, the
 * sections, and where to follow Paradize. Closes on the name at monument scale, cropped by the bottom
 * edge the way the reference crops it at the top.
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      <div className="mx-auto max-w-page px-4 sm:px-7">
        <div className="border-line grid gap-10 border-t py-14 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block">
              <Wordmark />
            </Link>
            <p className="text-small text-mute mt-5 max-w-[34ch]">
              A place to document hardware projects and source the parts they
              need. In development.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
            <p className="mono text-dim">Sections</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                ...navItems,
                ...utilityItems,
                {
                  href: "/#early-access",
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

          <div className="lg:col-span-3 lg:col-start-10">
            <p className="mono text-dim">Follow</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SITE_SOCIALS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener"
                    className="text-small text-mute hover:text-fg group inline-flex items-center gap-2 transition-colors"
                  >
                    {social.name}
                    <span
                      aria-hidden="true"
                      className="text-dim transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      &#8599;
                    </span>
                  </a>
                </li>
              ))}
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
