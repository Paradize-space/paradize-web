import type { Metadata } from "next";

import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { ActionArrow } from "@/components/controls/action-link";
import { WaitlistButton } from "@/components/controls/waitlist";
import { WaitlistCard } from "@/components/controls/waitlist-card";
import { Scope } from "@/components/research/scope";
import { pageMetadata, pages } from "@/lib/pages";
import { PageData } from "@/components/chrome/structured-data";

export const metadata: Metadata = pageMetadata(pages.research);

/**
 * Research.
 *
 * Nothing from the lab is public yet, and the page says exactly that.
 * What it has instead of content is an instrument: an oscilloscope with
 * four figures to tune and switch between. It is there to be played
 * with, and to say that something is on the bench without saying what.
 *
 * The one action is to be told when the first piece is out: the
 * waitlist, with Research already ticked.
 */
export default function ResearchPage() {
  return (
    <>
      <a
        href="#main"
        className="mono focus:bg-fg focus:text-bg sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:px-4 focus:py-3"
      >
        Skip to content
      </a>

      <PageData page={pages.research} />
      <SiteHeader />
      <WaitlistCard />

      <main id="main">
        {/* Wide, the words sit over the screen, low on the left. On a
            phone the screen is its own block and the words follow it. */}
        <section
          data-quiet
          className="relative isolate overflow-hidden lg:h-svh lg:min-h-[40rem]"
        >
          <Scope className="h-[68svh] min-h-[30rem] lg:absolute! lg:inset-0 lg:-z-10 lg:h-auto lg:min-h-0" />

          <div className="pointer-events-none flex flex-col justify-end px-4 pt-8 pb-16 sm:px-7 lg:h-full lg:pt-0">
            <div className="max-w-[36rem]">
              <p className="mono text-dim">03 — Research</p>
              <h1 className="text-display mt-6">Under test.</h1>
              <p className="text-lead text-mute mt-6 max-w-[38ch]">
                Paradize is also a research lab. What the team inside it is
                working on stays on the bench until it is ready to be read. The
                first piece to be published will appear on this page.
              </p>
              <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <WaitlistButton
                  variant="action"
                  size="action"
                  interests={["research"]}
                  className="group/action min-w-[15.625rem] justify-start"
                >
                  <ActionArrow />
                  Tell me when it is out
                </WaitlistButton>
                <p className="mono text-dim hidden lg:block">
                  Move to tune · click to change the figure
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
