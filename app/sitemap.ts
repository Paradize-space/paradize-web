import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Three real pages. Nothing listed that does not exist.
 *
 * `lastModified` is the date the page last changed in a way a reader or
 * a crawler would notice — its main copy, its structured data or its
 * links — written down by hand. It used to be the build time, which
 * stamped every page as new on every deploy. Google only trusts lastmod
 * when it is consistently accurate, so a date that always says "now"
 * teaches it to ignore the field. Bump a date when that page really
 * changes, and leave it alone for a style or copy-edit pass.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: "2026-10-10",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: "2026-09-22",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/research`,
      lastModified: "2026-09-22",
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
