import type { MetadataRoute } from "next";

/**
 * There is nothing on this site that should be hidden from a crawler,
 * and one route that should be: the waitlist endpoint accepts POSTs and
 * has no business in an index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://paradize.space/sitemap.xml",
    host: "https://paradize.space",
  };
}
