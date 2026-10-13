import type { MetadataRoute } from "next";

import { pages } from "@/lib/pages";
import { SITE_NAME } from "@/lib/site";

/**
 * The web manifest: the name, the mark and the black, for anything that
 * shows the site outside a tab (an installed shortcut, a share sheet).
 * A website, not an app, so it opens in the browser as usual.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: pages.home.share,
    start_url: "/",
    display: "browser",
    background_color: "#010101",
    theme_color: "#010101",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
