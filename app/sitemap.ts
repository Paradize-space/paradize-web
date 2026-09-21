import type { MetadataRoute } from "next";

const BASE = "https://paradize.space";

/** Three real pages. Nothing listed that does not exist. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: BASE, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${BASE}/marketplace`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/research`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
