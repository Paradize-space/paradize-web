import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { WaitlistCard } from "@/components/controls/waitlist-card";
import { Ruler } from "@/components/chrome/ruler";
import { StructuredData } from "@/components/chrome/structured-data";
import { FilmLazy } from "@/components/film/film-lazy";
import { EarlyAccess } from "@/components/sections/early-access";
import { Hero } from "@/components/sections/hero";
import { Status } from "@/components/sections/status";
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
      <WaitlistCard />

      {/* The landing page is the platform and nothing else. Marketplace
          and research have pages of their own; the streams section is
          where you leave for them, so it comes after the platform has
          been explained rather than before.

          The rulers are the page's recurring mark. They sit between the
          sections rather than inside them, so the numbering reads as one
          continuous scale down the document instead of as a label each
          section gave itself.

          Below the title screen is the film: one sample keypad, modelled
          in 3D, followed through every part of the product in a single
          scroll-driven shot. */}
      <main id="main">
        <Hero />
        <FilmLazy />
        <Ruler index="01" total="03" label="Where it stands" />
        <Status />
        <Ruler index="02" total="03" label="Also at Paradize" />
        <Streams />
        <Ruler index="03" total="03" label="Early access" />
        <EarlyAccess />
      </main>

      <SiteFooter />
    </>
  );
}
