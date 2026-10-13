import type { MetadataRoute } from "next";

import { absolute, pageList } from "@/lib/pages";

/**
 * The real pages, from lib/pages.ts. Nothing listed that does not exist.
 *
 * `lastModified` is the date the page last changed in a way a reader or
 * a crawler would notice — its main copy, its structured data or its
 * links — written down by hand in lib/pages.ts. It used to be the build
 * time, which stamped every page as new on every deploy. Google only
 * trusts lastmod when it is consistently accurate, so a date that
 * always says "now" teaches it to ignore the field. Bump a date when
 * that page really changes, and leave it alone for a style pass.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return pageList.map((page) => ({
    url: absolute(page.path),
    lastModified: page.updated,
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
