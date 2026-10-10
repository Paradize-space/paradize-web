import { SITE_ALTERNATE_NAMES, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Organization and WebSite markup.
 *
 * Deliberately thin. There is no `foundingDate`, no `founder`, no
 * `sameAs`, no `address` and no `contactPoint`, because none of those
 * are known facts that can be stated here — and structured data is
 * exactly the wrong place to guess. Only the name, the domain people
 * know it by, the URL, the logo that actually exists, and the same
 * description the page carries.
 *
 * Google takes the site name shown in results from the WebSite entry,
 * and only reads it on the home page, which is why this renders there
 * and nowhere else. The Organization entry carries the same names so
 * the two never disagree.
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        description:
          "A home for hardware projects: documented once, versioned as they change, and reproducible by someone else. Paradize is in development.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built only from constants in this repo — no user
      // or network input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
