import type { Metadata } from "next";

import { PageHeader } from "@/components/chrome/page-header";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { StandingCta } from "@/components/chrome/standing-cta";
import { EarlyAccess } from "@/components/sections/early-access";
import { Research } from "@/components/sections/research";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Paradize will have a research stream for work by our own team. It is closed to outside submissions and nothing has been published yet.",
  alternates: { canonical: "/research" },
  openGraph: {
    type: "website",
    url: "https://paradize.space/research",
    siteName: "Paradize",
    title: "Research — Paradize",
    description:
      "A research stream for work by the team inside Paradize. Nothing published yet.",
  },
};

export default function ResearchPage() {
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
          index="03"
          label="Research"
          heading="Work by the team inside Paradize."
          lede="A third stream alongside the platform and the marketplace. There is nothing to read yet, and this page says so rather than filling itself in."
          photo={photos.boardMono}
        />
        <Research />
        <EarlyAccess />
      </main>

      <SiteFooter />
    </>
  );
}
