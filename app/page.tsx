import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { StandingCta } from "@/components/chrome/standing-cta";
import { Ruler } from "@/components/chrome/ruler";
import { StructuredData } from "@/components/chrome/structured-data";
import { EarlyAccess } from "@/components/sections/early-access";
import { Hero } from "@/components/sections/hero";
import { Platform } from "@/components/sections/platform";
import { Route } from "@/components/sections/route";
import { Statement } from "@/components/sections/statement";
import { Streams } from "@/components/sections/streams";

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="mono focus:bg-fg focus:text-bg sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:px-4 focus:py-3"
      >
        Skip to content
      </a>

      <StructuredData />
      <SiteHeader />
      <StandingCta />

      {/* The landing page is the platform and nothing else. Marketplace
          and research have pages of their own; the streams section is
          where you leave for them.

          The rulers are the page's recurring mark. They sit between the
          sections rather than inside them, so the numbering reads as one
          continuous scale down the document instead of as a label each
          section gave itself. */}
      <main id="main">
        <Hero />
        <Ruler index="01" total="05" label="The problem" />
        <Statement />
        <Ruler index="02" total="05" label="Streams" />
        <Streams />
        <Ruler index="03" total="05" label="Route" />
        <Route />
        <Ruler index="04" total="05" label="Platform" />
        <Platform />
        <Ruler index="05" total="05" label="Early access" />
        <EarlyAccess />
      </main>

      <SiteFooter />
    </>
  );
}
