import type { Metadata } from "next";

import { DeepSky } from "@/components/chrome/deep-sky";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { StandingCta } from "@/components/chrome/standing-cta";
import { Words } from "@/components/chrome/words";

export const metadata: Metadata = {
  title: "Research",
  description:
    "A research stream for work by the team inside Paradize. Nothing published yet.",
  alternates: { canonical: "/research" },
  openGraph: {
    type: "website",
    url: "/research",
    siteName: "Paradize",
    title: "Research — Paradize",
    description:
      "A research stream for work by the team inside Paradize. Nothing published yet.",
  },
};

/**
 * Research.
 *
 * One line and a status, on a sky. That is the whole page.
 *
 * It had a good deal more on it — an empty-state readout, a set of
 * boundary statements about what the stream is and is not, a waitlist
 * — and all of it was true, but it was several screens of copy in
 * front of a stream that has published nothing. A page that says one
 * honest thing is a better answer to having nothing to show than four
 * sections explaining the nothing.
 *
 * The standing waitlist card stays, because it is site chrome rather
 * than research content, and it is the only route off this page for
 * anyone who wants to be told when the stream has something.
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

      <SiteHeader />
      <StandingCta />

      {/* One sky, fixed, behind the whole document. */}
      <DeepSky />

      {/* The wells darken the scene locally where the words are. The
          greys themselves are the site's own: the whole scene is
          graded down far enough that `text-mute` holds 5.97:1 on the
          wall the heading sits on, against 6.05:1 on plain black
          elsewhere. Lifting them for this page made its type visibly
          lighter than every other page's, which was its own kind of
          not matching. */}
      <div>
        <main
          id="main"
          className="relative flex min-h-svh flex-col justify-end px-6 pb-20 sm:px-10 lg:justify-center lg:pb-0"
        >
          <div className="text-well mx-auto w-full max-w-page py-32 lg:max-w-[46rem] lg:mr-auto lg:ml-[6vw]">
            {/* No index-and-ruler strip here. It is a measuring edge,
                and it earns its place on pages that have sections to
                measure — this one has a sentence. */}
            <Words as="h1" className="text-display max-w-[14ch]">
              {"Work by the team inside Paradize."}
            </Words>

            <p className="mono text-mute mt-12 flex items-center gap-3">
              <span aria-hidden="true" className="bg-line-2 block h-px w-10" />
              Coming soon
            </p>
          </div>
        </main>

        <div className="footer-well">
          <SiteFooter />
        </div>
      </div>
    </>
  );
}
