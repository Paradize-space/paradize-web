import type { Metadata } from "next";

import { PageHeader } from "@/components/chrome/page-header";
import { Ruler } from "@/components/chrome/ruler";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { StandingCta } from "@/components/chrome/standing-cta";
import { EarlyAccess } from "@/components/sections/early-access";
import { CloneDemo } from "@/components/sections/clone-demo";
import { KitStates } from "@/components/sections/kit-states";
import { Marketplace } from "@/components/sections/marketplace";
import { MarketplaceScope } from "@/components/sections/marketplace-scope";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Components and kits tied to the release you are building. A kit is the difference between a release and your inventory, so you source only the parts you are short of. Paradize is in development.",
  alternates: { canonical: "/marketplace" },
  openGraph: {
    type: "website",
    url: "/marketplace",
    siteName: "Paradize",
    title: "Marketplace — Paradize",
    description:
      "Components and kits tied to the release you are building. Source only the parts you are short of.",
  },
};

export default function MarketplacePage() {
  return (
    <>
      <a
        href="#main"
        className="mono focus:bg-fg focus:text-bg sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:px-4 focus:py-3"
      >
        Skip to content
      </a>

      <SiteHeader />
      <StandingCta />

      <main id="main">
        <PageHeader
          index="02"
          label="Marketplace"
          heading="Start with what you already own."
          lede="The parts a build needs are mostly parts somebody already has. The marketplace exists for the ones they do not."
          photo={photos.components}
        />

        {/* Same divider system as the landing page. The page header
            carries the site-level number, so these are labelled only —
            two numbering scales on one page would just compete. */}
        <Marketplace />
        <Ruler label="Preview" />
        <CloneDemo />
        <Ruler label="The four states" />
        <KitStates />
        <Ruler label="Scope" />
        <MarketplaceScope />
        <Ruler label="Early access" />
        <EarlyAccess />
      </main>

      <SiteFooter />
    </>
  );
}
