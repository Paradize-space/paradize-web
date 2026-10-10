import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * There is nothing on this site that should be hidden from a crawler,
 * and one route that should be: the waitlist endpoint accepts POSTs and
 * has no business in an index.
 *
 * No `Host` line. Google supports only user-agent, allow, disallow and
 * sitemap, and ignores the rest; the preferred address is stated by the
 * canonical links and the sitemap instead.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
