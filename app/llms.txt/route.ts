import { absolute, pages } from "@/lib/pages";
import {
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_SOCIALS,
  SITE_URL,
} from "@/lib/site";
import { built, notYet } from "@/lib/status";

/**
 * /llms.txt: the site in plain Markdown, for AI agents and the tools
 * people use to ask them about it (the llmstxt.org convention).
 *
 * Half the site is drawn on canvases (the keypad film, the market
 * network, the oscilloscope), which an agent reading HTML cannot see.
 * This says what they show, in words, from the same sources the pages
 * use: page descriptions from lib/pages.ts, the platform's status from
 * lib/status.ts. Nothing is in it that the site does not say.
 *
 * Built once, at build time.
 */
export const dynamic = "force-static";

const link = (page: (typeof pages)[keyof typeof pages]) =>
  `[${page.name}](${absolute(page.path)})`;

const body = `# ${SITE_NAME}

> ${SITE_NAME} is a home for hardware projects. A maker publishes a project once, as a release: drawings, parts list, firmware and build steps, fixed under one number. Anyone can check that release against the parts they already own, get what is missing, and build the same thing. ${SITE_NAME} is pre-launch and in development; there is a waitlist.

Also searched for as: ${SITE_ALTERNATE_NAMES.join(", ")}. The site is ${SITE_URL}.

## Pages

- ${link(pages.home)}: ${pages.home.description} The page follows one sample project, a nine-key macropad, through the product: publish a release, revise it (Mk 1.1 adds a knob, Mk 1.0 stays as it was), check it against your shelf (the two missing parts become the kit), and build it step by step.
- ${link(pages.marketplace)}: ${pages.marketplace.description} The page shows it as a network: stores stock the parts of projects, builders' shelves are checked first, and only the missing parts ship.
- ${link(pages.research)}: ${pages.research.description} The page is an oscilloscope you can play with: four figures (Lissajous, harmonograph, rose, spirograph) to tune and switch between.

## Where the platform stands

- Built: ${built.join(", ")}.
- Not yet: ${notYet.join(", ")}. Buying parts through the marketplace is not open.

## Good to know

- The people, stores and project shown on the site (Macropad; @mira, @theo, @kai, @lumen) are samples, not real accounts. Nothing is for sale.
- Join the waitlist: ${SITE_URL}/#early-access
- Follow: ${SITE_SOCIALS.map((s) => `${s.name} ${s.href}`).join(", ")}
`;

export function GET() {
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
