import type { Metadata } from "next";

import { SITE_NAME, SITE_URL } from "./site";

/**
 * The site's three pages, described once.
 *
 * Every place that tells a search engine or an AI agent what a page is
 * reads from here: the page's own metadata (title, description, share
 * card), the sitemap, the structured data and /llms.txt. Written in
 * separate files they drifted; the marketplace's share card went out
 * with the home page's title and no picture.
 *
 * `updated` is the date the page last changed in a way a reader or a
 * crawler would notice, written by hand (see app/sitemap.ts).
 */
export type Page = {
  path: string;
  /** Short name, as in the nav. */
  name: string;
  /** The page title, before " — Paradize". */
  title: string;
  /** For search results: what the page is, in a sentence or two. */
  description: string;
  /** For share cards: shorter. */
  share: string;
  updated: string;
  priority: number;
};

export const pages = {
  home: {
    path: "/",
    name: "Platform",
    title: "Paradize — a home for people who build hardware",
    description:
      "Document hardware projects, version the hardware and software together, check what you already have, and source what you still need. Paradize is in development.",
    share:
      "Document hardware projects, version the hardware and software together, check what you already have, and source what you still need.",
    updated: "2026-10-13",
    priority: 1,
  },
  marketplace: {
    path: "/marketplace",
    name: "Marketplace",
    title: "Marketplace",
    description:
      "Kits for the hardware projects on Paradize, checked against the parts you already own, so you only buy what you are missing. Built, and switched off until there are real sellers.",
    share:
      "Stores and builders, wired together: kits checked against the parts you already own, so you only buy what you are missing.",
    updated: "2026-10-13",
    priority: 0.7,
  },
  research: {
    path: "/research",
    name: "Research",
    title: "Research",
    description:
      "Paradize is also a research lab. Work by the team inside it will be published here; nothing is public yet.",
    share: "Paradize is also a research lab. Nothing is public yet.",
    updated: "2026-10-13",
    priority: 0.5,
  },
} satisfies Record<string, Page>;

export const pageList: Page[] = Object.values(pages);

export const absolute = (path: string) =>
  path === "/" ? SITE_URL : `${SITE_URL}${path}`;

/**
 * Metadata for a page below the home page: its title and description,
 * the canonical address, and share cards that are its own. The share
 * image comes from the opengraph-image file beside the page.
 */
export function pageMetadata(page: Page): Metadata {
  const full = `${page.title} — ${SITE_NAME}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      url: page.path,
      siteName: SITE_NAME,
      title: full,
      description: page.share,
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description: page.share,
    },
  };
}
