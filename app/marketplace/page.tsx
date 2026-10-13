import type { Metadata } from "next";

import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { WaitlistCard } from "@/components/controls/waitlist-card";
import { MarketNetwork } from "@/components/market/market-network";
import { pageMetadata, pages } from "@/lib/pages";
import { PageData } from "@/components/chrome/structured-data";

export const metadata: Metadata = pageMetadata(pages.marketplace);

/**
 * The marketplace: one screen that shows the idea by playing it, and
 * the footer. See components/market/market-network.tsx.
 */
export default function MarketplacePage() {
  return (
    <>
      <a
        href="#main"
        className="mono focus:bg-fg focus:text-bg sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:px-4 focus:py-3"
      >
        Skip to content
      </a>

      <PageData page={pages.marketplace} />
      <SiteHeader />
      <WaitlistCard />

      <main id="main">
        <MarketNetwork />
      </main>

      <SiteFooter />
    </>
  );
}
