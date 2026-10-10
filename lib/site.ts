/**
 * Who the site is, in one place.
 *
 * Search engines decide which address and which name belong to a site
 * by checking that the canonical link, the sitemap, robots.txt and the
 * structured data all agree. When the address was typed out in each of
 * those files separately, they could drift apart without anyone seeing
 * it. Everything that tells a crawler who we are reads from here.
 *
 * `SITE_URL` must be the address that answers 200 itself, not one that
 * redirects. The apex is primary in Vercel, and www redirects to it
 * with a 308.
 */
export const SITE_URL = "https://paradize.space";

/** The name is Paradize, and nothing else. */
export const SITE_NAME = "Paradize";

/**
 * Read by Google from `alternateName` in the structured data, in order
 * of preference. Neither is a second name for the organisation.
 *
 * "Paradize Space" is what people type when they are told the address
 * out loud and do not know `.space` is a domain ending. Listing it ties
 * that search to this site and this description, instead of to older
 * pages that used the phrase. The domain itself comes last, as Google's
 * site-name guidance shows it.
 */
export const SITE_ALTERNATE_NAMES = ["Paradize Space", "paradize.space"];
